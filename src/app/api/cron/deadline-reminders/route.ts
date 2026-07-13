import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendDeadlineReminderEmail } from "@/lib/training/email";

// Called daily by Vercel Cron. Protected by CRON_SECRET so only Vercel can trigger it.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Use service-role client — we need to read auth.users emails and all enrollments
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const now = new Date();
  // Remind at 7 days and 2 days remaining
  const REMINDER_DAYS = [7, 2];

  let sent = 0;
  let failed = 0;

  for (const daysLeft of REMINDER_DAYS) {
    const windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() + daysLeft);
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(windowStart);
    windowEnd.setHours(23, 59, 59, 999);

    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("user_id, course_id, expires_at, courses(title)")
      .neq("status", "completed")
      .gte("expires_at", windowStart.toISOString())
      .lte("expires_at", windowEnd.toISOString());

    if (error || !enrollments) continue;

    await Promise.allSettled(
      enrollments.map(async (enrollment) => {
        try {
          const courseTitle = (enrollment.courses as unknown as { title: string } | null)?.title;
          if (!courseTitle) return;

          const [{ data: profile }, { data: userRecord }] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("id", enrollment.user_id).maybeSingle(),
            supabase.auth.admin.getUserById(enrollment.user_id),
          ]);

          const email = userRecord?.user?.email;
          if (!email) return;

          await sendDeadlineReminderEmail({
            to: email,
            learnerName: profile?.full_name ?? "there",
            courseTitle,
            courseId: enrollment.course_id,
            expiresAt: enrollment.expires_at,
            daysLeft,
          });
          sent++;
        } catch {
          failed++;
        }
      })
    );
  }

  return NextResponse.json({ ok: true, sent, failed });
}
