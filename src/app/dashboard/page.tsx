import Link from "next/link";
import { getDashboardData } from "@/lib/training/courses";
import { formatDeadline, getDeadlineStatus, deadlineColors } from "@/lib/training/deadlines";

export default async function DashboardPage() {
  const enrolledCourses = await getDashboardData();

  const completedCourses = enrolledCourses.filter(({ progress }) => progress.percentage === 100);
  const expiredCourses = enrolledCourses.filter(({ expired }) => expired);
  const activeCourses = enrolledCourses.filter(({ progress, expired }) => progress.percentage < 100 && !expired);
  const certificates = enrolledCourses.filter(({ certificate }) => certificate !== null);
  const now = Date.now();
  const atRiskCourses = activeCourses.filter(({ enrollment }) => {
    if (!enrollment.expires_at) return false;
    const daysLeft = (new Date(enrollment.expires_at).getTime() - now) / 86400000;
    return daysLeft > 0 && daysLeft <= 7;
  });

  // Best candidate for the hero: furthest along active course
  const continueLearning = activeCourses.sort((a, b) => b.progress.percentage - a.progress.percentage)[0] ?? null;

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Learner area</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">Your dashboard</h1>
      <p className="mt-4 max-w-xl text-[#526b78]">Continue assigned learning and keep track of your course progress.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#002f65] p-5 text-white">
          <p className="text-sm text-white/65">Assigned courses</p>
          <p className="mt-2 text-3xl font-semibold">{enrolledCourses.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
          <p className="text-sm text-[#526b78]">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-[#002f65]">{completedCourses.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
          <p className="text-sm text-[#526b78]">Certificates earned</p>
          <p className="mt-2 text-3xl font-semibold text-[#002f65]">{certificates.length}</p>
        </div>
      </div>

      {/* At-risk notice */}
      {atRiskCourses.length > 0 && expiredCourses.length === 0 && (
        <section className="mt-6 rounded-2xl bg-[#fffbeb] p-5 ring-1 ring-[#fcd34d]">
          <p className="text-sm font-semibold text-[#92400e]">
            ⏰ {atRiskCourses.length} course{atRiskCourses.length !== 1 ? "s are" : " is"} due within 7 days.
          </p>
          <ul className="mt-2 space-y-1">
            {atRiskCourses.map(({ course, enrollment }) => {
              const daysLeft = Math.ceil((new Date(enrollment.expires_at!).getTime() - now) / 86400000);
              return (
                <li key={course.id} className="text-sm text-[#92400e]">
                  — {course.title} ({daysLeft} day{daysLeft !== 1 ? "s" : ""} left)
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Expired notice */}
      {expiredCourses.length > 0 && (
        <section className="mt-6 rounded-2xl bg-[#fff8f0] p-5 ring-1 ring-[#f5c07a]">
          <p className="text-sm font-semibold text-[#7c4a00]">
            ⚠️ {expiredCourses.length} course{expiredCourses.length !== 1 ? "s have" : " has"} passed its deadline.
            Contact your training coordinator to arrange re-enrolment.
          </p>
          <ul className="mt-2 space-y-1">
            {expiredCourses.map(({ course }) => (
              <li key={course.id} className="text-sm text-[#7c4a00]">— {course.title}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Hero: continue learning */}
      {continueLearning ? (
        <section className="mt-6 rounded-2xl bg-[#edf7f8] p-6 ring-1 ring-[#c7e7ea]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#007c8b]">Continue learning</p>
          <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#002f65]">{continueLearning.course.title}</h2>
              {continueLearning.nextLesson && (
                <p className="mt-2 text-sm text-[#526b78]">
                  Next up: <span className="font-medium text-[#002f65]">{continueLearning.nextLesson.lesson.title}</span>
                </p>
              )}
              <p className="mt-1 text-sm text-[#526b78]">
                {continueLearning.progress.completed} of {continueLearning.progress.total} required lessons complete
              </p>
            </div>
            <Link
              href={
                continueLearning.nextLesson
                  ? `/courses/${continueLearning.course.id}/modules/${continueLearning.nextLesson.module.id}/lessons/${continueLearning.nextLesson.lesson.id}`
                  : `/courses/${continueLearning.course.id}`
              }
              className="rounded-xl bg-[#007c8b] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#006b78]"
            >
              {continueLearning.nextLesson ? "Continue lesson" : "Resume course"}
            </Link>
          </div>
          <div className="mt-5 h-2 rounded-full bg-white">
            <div className="h-2 rounded-full bg-[#007c8b] transition-all" style={{ width: `${continueLearning.progress.percentage}%` }} />
          </div>
          <p className="mt-2 text-right text-xs text-[#007c8b]">{continueLearning.progress.percentage}% complete</p>
        </section>
      ) : completedCourses.length === enrolledCourses.length && enrolledCourses.length > 0 ? (
        <section className="mt-6 rounded-2xl bg-[#edf7f8] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#007c8b]">All caught up</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#002f65]">You have completed every assigned course.</h2>
          <Link href="/certificates" className="mt-4 inline-block text-sm font-semibold text-[#007c8b]">View your certificates →</Link>
        </section>
      ) : null}

      {/* All enrolled courses */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#002f65]">Your courses</h2>
          {certificates.length > 0 && (
            <Link href="/certificates" className="text-sm font-semibold text-[#007c8b]">Certificates →</Link>
          )}
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#9dd7de] bg-white p-10 text-center">
            <p className="text-4xl">📋</p>
            <p className="mt-4 font-semibold text-[#002f65]">No courses assigned yet</p>
            <p className="mt-2 text-sm leading-6 text-[#526b78]">
              Your administrator will assign training courses to you.<br />
              Check back here once you have been enrolled.
            </p>
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_COORDINATOR_EMAIL ?? "training@ekagra.com"}`}
              className="mt-5 inline-block text-sm font-semibold text-[#007c8b]"
            >
              Contact your training coordinator →
            </a>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {enrolledCourses.map(({ course, progress, nextLesson, certificate, expired, enrollment }) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className={`group rounded-2xl bg-white p-6 ring-1 transition ${expired ? "ring-[#f5c07a] hover:ring-[#e09c30]" : "ring-[#d5e9ed] hover:ring-[#007c8b]"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold text-[#002f65]">{course.title}</h3>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {expired ? (
                      <span className="rounded-full bg-[#fff0d6] px-3 py-1 text-xs font-semibold text-[#7c4a00]">Expired</span>
                    ) : progress.percentage === 100 ? (
                      <span className="rounded-full bg-[#e4f7ec] px-3 py-1 text-xs font-semibold text-[#145c36]">
                        {certificate ? "Certified" : "Complete"}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-[#007c8b]">{progress.percentage}%</span>
                    )}
                    {!expired && (() => {
                      const label = formatDeadline(enrollment.expires_at);
                      const status = getDeadlineStatus(enrollment.expires_at);
                      return label ? (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${deadlineColors[status]}`}>{label}</span>
                      ) : null;
                    })()}
                  </div>
                </div>

                {!expired && nextLesson && progress.percentage < 100 && (
                  <p className="mt-2 text-sm text-[#526b78]">
                    Next: <span className="font-medium text-[#002f65]">{nextLesson.lesson.title}</span>
                  </p>
                )}
                {expired && (
                  <p className="mt-2 text-sm text-[#b45309]">Deadline passed — contact your coordinator to re-enrol.</p>
                )}
                {certificate && progress.percentage === 100 && (
                  <p className="mt-2 text-xs text-[#007c8b]">
                    Issued {new Date(certificate.issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}

                <div className={`mt-5 h-2 rounded-full ${expired ? "bg-[#f5e4c4]" : "bg-[#d9f2f4]"}`}>
                  <div
                    className={`h-2 rounded-full transition-all ${expired ? "bg-[#e09c30]" : progress.percentage === 100 ? "bg-[#2ea86b]" : "bg-[#007c8b]"}`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-[#526b78]">{progress.completed} of {progress.total} required lessons complete</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
