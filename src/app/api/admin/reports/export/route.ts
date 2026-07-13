import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listProgressReports } from "@/lib/training/courses";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const role = claims?.claims?.app_metadata?.role as string | undefined;
  if (role !== "administrator" && role !== "instructor") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const rows = await listProgressReports();

  const header = [
    "Learner",
    "Course",
    "Status",
    "Enrolled",
    "Deadline",
    "Completed",
    "Lessons done",
    "Lessons total",
    "Progress %",
    "Latest score %",
    "Passed",
    "Certificate issued",
    "At risk",
  ].join(",");

  const escape = (v: string | number | boolean | null | undefined) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = rows.map((r) =>
    [
      r.learner_name,
      r.course_title,
      r.status,
      r.assigned_at ? new Date(r.assigned_at).toLocaleDateString("en-GB") : "",
      r.expires_at ? new Date(r.expires_at).toLocaleDateString("en-GB") : "",
      r.completed_at ? new Date(r.completed_at).toLocaleDateString("en-GB") : "",
      r.lessons_completed,
      r.lessons_total,
      r.progress_percentage,
      r.latest_score ?? "",
      r.latest_passed === null ? "" : r.latest_passed ? "Yes" : "No",
      r.certificate_issued_at ? new Date(r.certificate_issued_at).toLocaleDateString("en-GB") : "",
      r.at_risk ? "Yes" : "No",
    ]
      .map(escape)
      .join(",")
  );

  const csv = [header, ...lines].join("\r\n");
  const filename = `training-report-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
