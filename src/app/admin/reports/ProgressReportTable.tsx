"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ReportRow = {
  id: string;
  user_id: string;
  course_id: string;
  learner_name: string;
  course_title: string;
  lessons_completed: number;
  lessons_total: number;
  progress_percentage: number;
  latest_score: number | null;
  latest_passed: boolean | null;
  certificate_issued_at: string | null;
  expires_at: string | null;
  days_until_expiry: number | null;
  at_risk: boolean;
  assigned_at?: string | null;
};

export default function ProgressReportTable({
  rows,
  initialCourseFilter = "",
}: {
  rows: ReportRow[];
  initialCourseFilter?: string;
}) {
  const [query, setQuery] = useState(initialCourseFilter);
  const [status, setStatus] = useState("all");

  // Sync when the server-side course filter changes (e.g. clicking a course link)
  useEffect(() => {
    if (initialCourseFilter) setQuery(initialCourseFilter);
  }, [initialCourseFilter]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesQuery = `${row.learner_name} ${row.course_title}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesStatus =
          status === "all" ||
          (status === "at-risk" && row.at_risk) ||
          (status === "complete" && row.progress_percentage === 100) ||
          (status === "in-progress" && row.progress_percentage > 0 && row.progress_percentage < 100) ||
          (status === "not-started" && row.progress_percentage === 0);
        return matchesQuery && matchesStatus;
      }),
    [query, rows, status],
  );

  return (
    <>
      <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#d5e9ed] md:flex-row">
        <label className="flex-1">
          <span className="sr-only">Search learners or courses</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search learners or courses"
            className="w-full rounded-xl border border-[#d5e9ed] px-4 py-3 text-sm outline-none focus:border-[#007c8b]"
          />
        </label>
        <label>
          <span className="sr-only">Filter progress</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-[#d5e9ed] bg-white px-4 py-3 text-sm text-[#526b78] outline-none focus:border-[#007c8b] md:min-w-48"
          >
            <option value="all">All progress</option>
            <option value="at-risk">At risk</option>
            <option value="not-started">Not started</option>
            <option value="in-progress">In progress</option>
            <option value="complete">Complete</option>
          </select>
        </label>
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setStatus("all"); }}
            className="rounded-xl border border-[#d5e9ed] px-4 py-3 text-sm text-[#526b78] hover:border-[#007c8b] hover:text-[#002f65]"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-[#d5e9ed]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#d5e9ed] text-[#526b78]">
            <tr>
              {["Learner", "Course", "Enrolled", "Progress", "Deadline", "Latest score", "Assessment", "Certificate", ""].map(
                (h) => <th key={h} className="px-5 py-4 font-medium">{h}</th>,
              )}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className={`border-b border-[#edf4f5] last:border-0 ${row.at_risk ? "bg-[#fffaf4]" : ""}`}>
                <td className="px-5 py-4 font-medium text-[#002f65]">{row.learner_name}</td>
                <td className="px-5 py-4 text-[#526b78]">
                  <Link href={`/admin/courses/${row.course_id}`} className="hover:underline hover:text-[#007c8b]">
                    {row.course_title}
                  </Link>
                </td>
                <td className="px-5 py-4 text-xs text-[#526b78]">
                  {row.assigned_at
                    ? new Date(row.assigned_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : <span className="text-[#b0c8d0]">—</span>}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-[#d9f2f4]">
                      <div
                        className="h-1.5 rounded-full bg-[#007c8b]"
                        style={{ width: `${row.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#526b78]">{row.progress_percentage}%</span>
                  </div>
                </td>
                <td className={`px-5 py-4 text-xs font-semibold ${row.at_risk ? "text-[#b45309]" : "text-[#526b78]"}`}>
                  {row.days_until_expiry === null
                    ? "No deadline"
                    : row.days_until_expiry < 0
                    ? "Expired"
                    : `${row.days_until_expiry}d left`}
                </td>
                <td className="px-5 py-4 text-[#526b78]">
                  {row.latest_score === null ? "—" : `${row.latest_score}%`}
                </td>
                <td className="px-5 py-4">
                  {row.latest_passed === null ? (
                    <span className="text-[#b0c8d0]">Not attempted</span>
                  ) : row.latest_passed ? (
                    <span className="rounded-full bg-[#e4f7ec] px-2.5 py-1 text-xs font-semibold text-[#145c36]">Passed</span>
                  ) : (
                    <span className="rounded-full bg-[#fff0ef] px-2.5 py-1 text-xs font-semibold text-[#9d2c25]">Not passed</span>
                  )}
                </td>
                <td className="px-5 py-4 text-[#526b78]">
                  {row.certificate_issued_at
                    ? new Date(row.certificate_issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : <span className="text-[#b0c8d0]">—</span>}
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/reports/learner/${row.user_id}`}
                    className="text-xs font-semibold text-[#007c8b] hover:underline"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRows.length === 0 && (
          <p className="p-10 text-center text-sm text-[#526b78]">No learner records match these filters.</p>
        )}
      </div>
    </>
  );
}
