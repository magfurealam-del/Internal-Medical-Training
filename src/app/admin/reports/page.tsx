import Link from "next/link";
import { listProgressReports } from "@/lib/training/courses";
import { requireTrainingStaff } from "@/lib/training/auth";
import ProgressReportTable from "./ProgressReportTable";

export default async function AdminReportsPage() {
  await requireTrainingStaff();
  const rows = await listProgressReports();
  const completed = rows.filter((row) => row.progress_percentage === 100).length;
  const passed = rows.filter((row) => row.latest_passed === true).length;
  const certificates = rows.filter((row) => row.certificate_issued_at).length;
  const atRisk = rows.filter((row) => row.at_risk).length;
  const averageProgress = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.progress_percentage, 0) / rows.length) : 0;
  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10"><Link href="/admin" className="text-sm font-medium text-[#007c8b]">← Administration</Link><div className="mt-10 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Reporting</p><h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">Learner progress</h1><p className="mt-4 text-[#526b78]">Monitor lesson completion, assessment results, deadlines, and certificates.</p></div><a href="/admin/reports/export" className="rounded-xl bg-[#002f65] px-5 py-3 text-sm font-semibold text-white">Download CSV</a></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><div className="rounded-2xl bg-[#002f65] p-5 text-white"><p className="text-sm text-white/65">Assignments</p><p className="mt-2 text-3xl font-semibold">{rows.length}</p></div><div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]"><p className="text-sm text-[#526b78]">Average progress</p><p className="mt-2 text-3xl font-semibold text-[#002f65]">{averageProgress}%</p></div><div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]"><p className="text-sm text-[#526b78]">Completed</p><p className="mt-2 text-3xl font-semibold text-[#002f65]">{completed}</p></div><div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]"><p className="text-sm text-[#526b78]">At risk</p><p className="mt-2 text-3xl font-semibold text-[#b45309]">{atRisk}</p></div><div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]"><p className="text-sm text-[#526b78]">Passed / certified</p><p className="mt-2 text-3xl font-semibold text-[#002f65]">{passed} / {certificates}</p></div></div><ProgressReportTable rows={rows} /></main>;
}
