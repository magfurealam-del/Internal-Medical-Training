import Link from "next/link";
import { listAllCourses } from "@/lib/training/courses";
import CourseCreateForm from "./CourseCreateForm";
import { requireTrainingStaff } from "@/lib/training/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getAdminStats() {
  const supabase = await createSupabaseServerClient();
  const [
    { count: totalEnrollments },
    { count: completedEnrollments },
    { count: totalLearners },
    { count: totalCertificates },
    { data: atRiskRows },
  ] = await Promise.all([
    supabase.from("enrollments").select("*", { count: "exact", head: true }),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("certificates").select("*", { count: "exact", head: true }),
    supabase
      .from("enrollments")
      .select("user_id, course_id, expires_at, status")
      .neq("status", "completed")
      .lt("expires_at", new Date(Date.now() + 14 * 86400000).toISOString())
      .gt("expires_at", new Date().toISOString()),
  ]);

  // Overdue: expires_at < now and not completed
  const { count: overdueCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .neq("status", "completed")
    .lt("expires_at", new Date().toISOString());

  return {
    totalEnrollments: totalEnrollments ?? 0,
    completedEnrollments: completedEnrollments ?? 0,
    totalLearners: totalLearners ?? 0,
    totalCertificates: totalCertificates ?? 0,
    dueSoonCount: (atRiskRows ?? []).length,
    overdueCount: overdueCount ?? 0,
  };
}

export default async function AdminPage() {
  await requireTrainingStaff();
  const [courses, stats] = await Promise.all([listAllCourses(), getAdminStats()]);

  const completionRate = stats.totalEnrollments
    ? Math.round((stats.completedEnrollments / stats.totalEnrollments) * 100)
    : 0;

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Administration</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">Platform overview</h1>
      <p className="mt-4 max-w-xl text-[#526b78]">Manage the training catalogue, enrollments, and learner progress.</p>

      {/* Stat cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-[#002f65] p-5 text-white">
          <p className="text-sm text-white/65">Total learners</p>
          <p className="mt-2 text-3xl font-semibold">{stats.totalLearners}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
          <p className="text-sm text-[#526b78]">Enrollments</p>
          <p className="mt-2 text-3xl font-semibold text-[#002f65]">{stats.totalEnrollments}</p>
          <p className="mt-1 text-xs text-[#526b78]">{completionRate}% completion rate</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
          <p className="text-sm text-[#526b78]">Certificates issued</p>
          <p className="mt-2 text-3xl font-semibold text-[#002f65]">{stats.totalCertificates}</p>
        </div>
        <div className={`rounded-2xl p-5 ring-1 ${stats.overdueCount > 0 ? "bg-[#fff8f0] ring-[#f5c07a]" : "bg-white ring-[#d5e9ed]"}`}>
          <p className="text-sm text-[#526b78]">Overdue / due soon</p>
          <p className={`mt-2 text-3xl font-semibold ${stats.overdueCount > 0 ? "text-[#b45309]" : "text-[#002f65]"}`}>
            {stats.overdueCount} / {stats.dueSoonCount}
          </p>
          {stats.overdueCount > 0 && (
            <Link href="/admin/reports?status=at-risk" className="mt-1 block text-xs font-semibold text-[#007c8b] hover:underline">
              View in reports →
            </Link>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link
          href="/admin/reports"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf7f8] text-xl">📊</span>
          <div>
            <p className="font-semibold text-[#002f65]">Progress reports</p>
            <p className="mt-0.5 text-xs text-[#526b78]">Learner completion and at-risk view</p>
          </div>
        </Link>
        <Link
          href="/admin/reports/export"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf7f8] text-xl">📥</span>
          <div>
            <p className="font-semibold text-[#002f65]">Download CSV</p>
            <p className="mt-0.5 text-xs text-[#526b78]">Full progress data export</p>
          </div>
        </Link>
        <Link
          href="/admin/users"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf7f8] text-xl">👥</span>
          <div>
            <p className="font-semibold text-[#002f65]">User management</p>
            <p className="mt-0.5 text-xs text-[#526b78]">Invite staff and manage roles</p>
          </div>
        </Link>
        <Link
          href="/courses"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf7f8] text-xl">🎓</span>
          <div>
            <p className="font-semibold text-[#002f65]">Learner view</p>
            <p className="mt-0.5 text-xs text-[#526b78]">See the platform as a learner</p>
          </div>
        </Link>
      </div>

      {/* Courses + create */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <section className="rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#002f65]">Courses</h2>
            <span className="text-sm text-[#526b78]">{courses.length} total</span>
          </div>
          {courses.length === 0 ? (
            <p className="mt-8 rounded-xl bg-[#f6feff] p-6 text-sm text-[#526b78]">No courses created yet.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/admin/courses/${course.id}`}
                  className="flex items-center justify-between rounded-xl border border-[#d5e9ed] p-4 transition hover:border-[#007c8b]"
                >
                  <div>
                    <h3 className="font-semibold text-[#002f65]">{course.title}</h3>
                    <p className="mt-1 text-xs text-[#526b78]">{course.slug}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    course.status === "published" ? "bg-[#e4f7ec] text-[#145c36]" :
                    course.status === "archived" ? "bg-[#f0f4f5] text-[#526b78]" :
                    "bg-[#d9f2f4] text-[#007c8b]"
                  }`}>
                    {course.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-[#002f65] p-6 text-white">
          <h2 className="text-2xl font-semibold">Create a course</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Start with metadata here. Curriculum is managed through GitHub.
          </p>
          <CourseCreateForm />
        </section>
      </div>
    </main>
  );
}
