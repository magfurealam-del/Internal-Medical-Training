import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearnerDetail } from "@/lib/training/courses";
import { requireTrainingStaff } from "@/lib/training/auth";
import { formatDeadline, getDeadlineStatus, deadlineColors } from "@/lib/training/deadlines";

export default async function LearnerDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  await requireTrainingStaff();
  const { userId } = await params;
  const { profile, courseDetails, quizAttempts } = await getLearnerDetail(userId);
  if (!profile) notFound();

  const name = profile.full_name ?? "Unnamed learner";

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      <Link href="/admin/reports" className="text-sm font-medium text-[#007c8b]">← Reports</Link>

      <div className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Learner profile</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">{name}</h1>
        <p className="mt-2 text-sm text-[#526b78] capitalize">{profile.role}</p>
      </div>

      {/* Summary strip */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-[#002f65] p-5 text-white">
          <p className="text-sm text-white/65">Courses enrolled</p>
          <p className="mt-2 text-3xl font-semibold">{courseDetails.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
          <p className="text-sm text-[#526b78]">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-[#002f65]">
            {courseDetails.filter((c) => c.progress_percentage === 100).length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
          <p className="text-sm text-[#526b78]">Quiz attempts</p>
          <p className="mt-2 text-3xl font-semibold text-[#002f65]">{quizAttempts.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
          <p className="text-sm text-[#526b78]">Certificates</p>
          <p className="mt-2 text-3xl font-semibold text-[#002f65]">
            {courseDetails.filter((c) => c.certificate).length}
          </p>
        </div>
      </div>

      {/* Per-course breakdown */}
      {courseDetails.length === 0 ? (
        <p className="mt-10 text-sm text-[#526b78]">This learner has no course enrolments.</p>
      ) : (
        <div className="mt-10 space-y-6">
          {courseDetails.map(({ enrollment, course_title, lessons_completed, lessons_total, progress_percentage, moduleProgress, certificate }) => {
            const deadlineLabel = formatDeadline(enrollment.expires_at);
            const deadlineStatus = getDeadlineStatus(enrollment.expires_at);
            const isComplete = progress_percentage === 100;

            return (
              <section key={enrollment.id} className="rounded-2xl bg-white ring-1 ring-[#d5e9ed]">
                {/* Course header */}
                <div className="flex flex-wrap items-start justify-between gap-4 p-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[#002f65]">{course_title}</h2>
                    <p className="mt-1 text-sm text-[#526b78]">
                      Enrolled {new Date(enrollment.assigned_at as string).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isComplete ? (
                      <span className="rounded-full bg-[#e4f7ec] px-3 py-1 text-xs font-semibold text-[#145c36]">Complete</span>
                    ) : (
                      <span className="rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-semibold text-[#007c8b]">{progress_percentage}%</span>
                    )}
                    {deadlineLabel && (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${deadlineColors[deadlineStatus]}`}>
                        {deadlineLabel}
                      </span>
                    )}
                    {certificate && (
                      <Link
                        href={`/certificates/${certificate.id}`}
                        className="text-xs font-semibold text-[#007c8b] hover:underline"
                      >
                        View certificate →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-6 pb-2">
                  <div className="h-2 rounded-full bg-[#d9f2f4]">
                    <div className="h-2 rounded-full bg-[#007c8b] transition-all" style={{ width: `${progress_percentage}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-[#526b78]">{lessons_completed} of {lessons_total} required lessons complete</p>
                </div>

                {/* Module lesson breakdown */}
                {moduleProgress.length > 0 && (
                  <div className="mt-4 border-t border-[#edf4f5] px-6 pb-6">
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#526b78]">Lessons</p>
                    <div className="mt-3 space-y-1">
                      {moduleProgress.map(({ module: mod, lessons }) => (
                        <div key={mod.id}>
                          <p className="mt-3 text-xs font-semibold text-[#007c8b]">{mod.title}</p>
                          {lessons.map((lesson) => (
                            <div key={lesson.id} className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
                              {lesson.completed_at ? (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e4f7ec] text-xs text-[#145c36]">✓</span>
                              ) : (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f0f4f5] text-xs text-[#b0c8d0]">○</span>
                              )}
                              <span className={lesson.completed_at ? "text-[#002f65]" : "text-[#526b78]"}>{lesson.title}</span>
                              {lesson.completed_at && (
                                <span className="ml-auto text-xs text-[#b0c8d0]">
                                  {new Date(lesson.completed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Quiz attempt history */}
      {quizAttempts.length > 0 && (
        <section className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]">
          <h2 className="text-xl font-semibold text-[#002f65]">Assessment history</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-[#edf4f5] text-[#526b78]">
                <tr>
                  <th className="pb-3 text-left font-medium">Date</th>
                  <th className="pb-3 text-left font-medium">Quiz</th>
                  <th className="pb-3 text-left font-medium">Score</th>
                  <th className="pb-3 text-left font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {quizAttempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-[#edf4f5] last:border-0">
                    <td className="py-3 pr-6 text-[#526b78]">
                      {new Date(attempt.submitted_at as string).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 pr-6 font-mono text-xs text-[#526b78]">{attempt.quiz_id}</td>
                    <td className="py-3 pr-6 font-semibold text-[#002f65]">{attempt.score_percentage}%</td>
                    <td className="py-3">
                      {attempt.passed ? (
                        <span className="rounded-full bg-[#e4f7ec] px-2.5 py-1 text-xs font-semibold text-[#145c36]">Passed</span>
                      ) : (
                        <span className="rounded-full bg-[#fff0ef] px-2.5 py-1 text-xs font-semibold text-[#9d2c25]">Not passed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
