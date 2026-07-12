import { NextResponse } from "next/server";
import { listProgressReports } from "@/lib/training/courses";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function csvCell(value: string | number | null | undefined): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const role = data?.claims?.app_metadata?.role;
  if (role !== "administrator" && role !== "instructor") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const rows = await listProgressReports();

  const headers = [
    "Learner",
    "Course",
    "Enrollment status",
    "Lessons completed",
    "Lessons total",
    "Progress %",
    "Latest quiz score %",
    "Quiz passed",
    "Certificate issued",
    "Deadline",
    "Completed date",
    "Days until deadline",
    "At risk",
  ];

  const csvRows = rows.map((row) => [
    csvCell(row.learner_name),
    csvCell(row.course_title),
    csvCell(row.status),
    csvCell(row.lessons_completed),
    csvCell(row.lessons_total),
    csvCell(row.progress_percentage),
    csvCell(row.latest_score),
    csvCell(row.latest_passed === null ? "" : row.latest_passed ? "Yes" : "No"),
    csvCell(row.certificate_issued_at
      ? new Date(row.certificate_issued_at).toLocaleDateString("en-GB")
      : ""),
    csvCell(row.expires_at ? new Date(row.expires_at).toLocaleDateString("en-GB") : ""),
    csvCell(row.completed_at ? new Date(row.completed_at).toLocaleDateString("en-GB") : ""),
    csvCell(row.days_until_expiry),
    csvCell(row.at_risk ? "Yes" : "No"),
  ].join(","));

  const csv = [headers.map(csvCell).join(","), ...csvRows].join("\n");
  const filename = `training-progress-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
