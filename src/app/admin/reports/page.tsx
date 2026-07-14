import Link from "next/link";
import { listProgressReports } from "@/lib/training/courses";
import { requireTrainingStaff } from "@/lib/training/auth";
import ProgressReportTable from "./ProgressReportTable";

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {

  await requireTrainingStaff();
  const { course: courseFilter } = await searchParams;
  const rows = await listProgressReports();

  const total = rows.length;
  const completed = rows.filter((r) => r.progress_percentage === 100).length;
  const atRisk = rows.filter((r) => r.at_risk).length;
  const passed = rows.filter((r) => r.latest_passed === true).length;
  const certificates = rows.filter((r) => r.certificate_issued_at).length;
  const averageProgress = total
    ? Math.round(rows.reduce((sum, r) => sum + r.progress_percentage, 0) / total)
    : 0;

  // Per-course summary
  const byCourse = new Map<string, { id: string; title: string; enrolled: number; completed: number; atRisk: number; passed: number }>();
  for (const r of rows) {
    if (!byCourse.has(r.course_id)) {
      byCourse.set(r.course_id, { id: r.course_id, title: r.course_title, enrolled: 0, completed: 0, atRisk: 0, passed: 0 });
    }
    const c = byCourse.get(r.course_id)!;
    c.enrolled++;
    if (r.progress_percentage === 100) c.completed++;
    if (r.at_risk) c.atRisk++;
    if (r.latest_passed) c.passed++;
  }
  const courseRows = [...byCourse.values()].sort((a, b) => b.enrolled - a.enrolled);

  // At-risk learners (sorted: most urgent first)
  const atRiskRows = rows
    .filter((r) => r.at_risk)
    .sort((a, b) => (a.days_until_expiry ?? 999) - (b.days_until_expiry ?? 999));

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <Link href="/admin" className="text-sm font-medium text-[#007c8b]">← Administration</Link>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Reporting</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">Learner progress</h1>
          <p className="mt-4 text-[#526b78]">Monitor lesson completion, assessment results, deadlines, and certificates.</p>
        </div>
        <a href="/admin/reports/export" className="rounded-xl bg-[#002f65] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001f43]">
          Download CSV
        </a>
      </div>

      {/* Summary stat cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl bg-[#002f65] p-5 text-white">
          <p className="text-sm text-white/65">Assignments</p>
          <p className="mt-2 text-3xl font-semibold">{total}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
          <p className="text-sm text-[#526b78]">Avg progress</p>
          <p className="mt-2 text-3xl font-semibold text-[#002f65]">{averageProgress}%</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
          <p className="text-sm text-[#526b78]">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-[#002f65]">{completed}</p>
        </div>
        <div className={`rounded-2xl p-5 ring-1 ${atRisk > 0 ? "bg-[#fff8f0] ring-[#f5c07a]" : "bg-white ring-[#d5e9ed]"}`}>
          <p className="text-sm text-[#526b78]">At risk</p>
          <p className={`mt-2 text-3xl font-semibold ${atRisk > 0 ? "text-[#b45309]" : "text-[#002f65]"}`}>{atRisk}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
          <p className="text-sm text-[#526b78]">Passed / certified</p>
          <p className="mt-2 text-3xl font-semibold text-[#002f65]">{passed} / {certificates}</p>
        </div>
      </div>

      {/* At-risk spotlight */}
      {atRiskRows.length > 0 && (
        <section className="mt-8 rounded-2xl bg-[#fff8f0] p-6 ring-1 ring-[#f5c07a]">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <h2 className="text-lg font-semibold text-[#7c4a00]">
              {atRiskRows.length} learner{atRiskRows.length !== 1 ? "s" : ""} at risk of missing their deadline
            </h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {atRiskRows.map((r) => (
              <Link
                key={r.id}
                href={`/admin/reports/learner/${r.user_id}`}
                className="rounded-xl bg-white p-4 ring-1 ring-[#f5c07a] transition hover:ring-[#e09c30]"
              >
                <p className="font-semibold text-[#002f65]">{r.learner_name}</p>
                <p className="mt-0.5 text-sm text-[#526b78]">{r.course_title}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="h-1.5 flex-1 rounded-full bg-[#f5e4c4]">
                    <div
                      className="h-1.5 rounded-full bg-[#e09c30]"
                      style={{ width: `${r.progress_percentage}%` }}
                    />
                  </div>
                  <span className="ml-3 text-xs font-semibold text-[#b45309]">{r.progress_percentage}%</span>
                </div>
                <p className="mt-2 text-xs text-[#b45309]">
                  {r.days_until_expiry !== null && r.days_until_expiry >= 0
                    ? `${r.days_until_expiry} day${r.days_until_expiry === 1 ? "" : "s"} left`
                    : "Deadline passed"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Per-course summary */}
      {courseRows.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-[#002f65]">Completion by course</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-[#d5e9ed]">
            <table className="min-w-full text-sm">
              <thead className="border-b border-[#d5e9ed] text-[#526b78]">
                <tr>
                  {["Course", "Enrolled", "Completed", "Completion rate", "Passed quiz", "At risk"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courseRows.map((c) => {
                  const rate = c.enrolled ? Math.round((c.completed / c.enrolled) * 100) : 0;
                  return (
                    <tr key={c.title} className="border-b border-[#edf4f5] last:border-0">
                      <td className="px-5 py-4 font-medium text-[#002f65]">
                        <Link href={`/admin/courses/${c.id}`} className="hover:underline hover:text-[#007c8b]">
                          {c.title}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-[#526b78]">{c.enrolled}</td>
                      <td className="px-5 py-4 text-[#526b78]">{c.completed}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 rounded-full bg-[#d9f2f4]">
                            <div className="h-1.5 rounded-full bg-[#007c8b]" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-[#007c8b]">{rate}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#526b78]">{c.passed}</td>
                      <td className="px-5 py-4">
                        {c.atRisk > 0 ? (
                          <span className="rounded-full bg-[#fff0d6] px-2.5 py-1 text-xs font-semibold text-[#b45309]">
                            {c.atRisk} at risk
                          </span>
                        ) : (
                          <span className="text-[#b0c8d0]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Full learner table */}
      <section className="mt-8" id="learners">
        <h2 className="text-xl font-semibold text-[#002f65]">All learners</h2>
        <ProgressReportTable rows={rows} initialCourseFilter={courseFilter ?? ""} />
      </section>
    </main>
  );
}
