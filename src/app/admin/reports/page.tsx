import Link from "next/link";
import { listProgressReports } from "@/lib/training/courses";
import { requireTrainingStaff } from "@/lib/training/auth";

export default async function AdminReportsPage() {
  await requireTrainingStaff();
  const rows = await listProgressReports();
  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
    <Link href="/admin" className="text-sm font-medium text-[#007c8b]">← Administration</Link>
    <div className="mt-10 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Reporting</p><h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">Learner progress</h1><p className="mt-4 text-[#526b78]">Monitor lesson completion, assessment results, and certificates.</p></div><a href="/admin/reports/export" className="rounded-xl bg-[#002f65] px-5 py-3 text-sm font-semibold text-white">Download CSV</a></div>
    <div className="mt-10 overflow-x-auto rounded-2xl bg-white ring-1 ring-[#d5e9ed]"><table className="min-w-full text-left text-sm"><thead className="border-b border-[#d5e9ed] text-[#526b78]"><tr><th className="px-5 py-4 font-medium">Learner</th><th className="px-5 py-4 font-medium">Course</th><th className="px-5 py-4 font-medium">Progress</th><th className="px-5 py-4 font-medium">Latest score</th><th className="px-5 py-4 font-medium">Assessment</th><th className="px-5 py-4 font-medium">Certificate</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-[#edf4f5] last:border-0"><td className="px-5 py-4 font-medium text-[#002f65]">{row.learner_name}</td><td className="px-5 py-4 text-[#526b78]">{row.course_title}</td><td className="px-5 py-4 text-[#526b78]">{row.lessons_completed}/{row.lessons_total} ({row.progress_percentage}%)</td><td className="px-5 py-4 text-[#526b78]">{row.latest_score === null ? "—" : `${row.latest_score}%`}</td><td className="px-5 py-4 text-[#526b78]">{row.latest_passed === null ? "Not attempted" : row.latest_passed ? "Passed" : "Not passed"}</td><td className="px-5 py-4 text-[#526b78]">{row.certificate_issued_at ? new Date(row.certificate_issued_at).toLocaleDateString() : "—"}</td></tr>)}</tbody></table>{rows.length === 0 && <p className="p-10 text-center text-sm text-[#526b78]">No learner records yet.</p>}</div>
  </main>;
}
