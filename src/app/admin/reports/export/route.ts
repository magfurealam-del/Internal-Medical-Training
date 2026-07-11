import { NextResponse } from "next/server";
import { listEnrollmentReports } from "@/lib/training/courses";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const role = data?.claims?.app_metadata?.role;
  if (role !== "administrator" && role !== "instructor") return new NextResponse("Forbidden", { status: 403 });
  const rows = await listEnrollmentReports();
  const headers = ["learner", "course", "status", "assigned_at", "expires_at", "completed_at"];
  const csv = [headers.join(","), ...rows.map((row) => [row.learner_name, row.course_title, row.status, row.assigned_at, row.expires_at ?? "", row.completed_at ?? ""].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))].join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=training-enrollment-report.csv" } });
}
