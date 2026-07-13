import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseDetailData } from "@/lib/training/courses";
import { formatDeadline, getDeadlineStatus, deadlineColors, isExpired } from "@/lib/training/deadlines";

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const data = await getCourseDetailData(courseId);
  if (!data) notFound();

  const { course, modules, progress, nextLesson, enrollment } = data;
  const deadlineLabel = formatDeadline(enrollment?.expires_at ?? null);
  const deadlineStatus = getDeadlineStatus(enrollment?.expires_at ?? null);
  const enrollmentExpired = progress.percentage < 100 && isExpired(enrollment?.expires_at ?? null);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      <Link href="/courses" className="text-sm font-medium text-[#007c8b]">← All courses</Link>

      <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Course overview</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">{course.title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#526b78]">{course.description ?? "Course description coming soon."}</p>

      {enrollmentExpired && (
        <div className="mt-8 rounded-2xl bg-[#fff8f0] p-5 ring-1 ring-[#f5c07a]">
          <p className="font-semibold text-[#7c4a00]">⚠️ Your enrolment deadline has passed</p>
          <p className="mt-1 text-sm text-[#7c4a00]">
            You can still review the material, but your progress will not count towards a certificate.
            Contact your training coordinator to arrange re-enrolment.
          </p>
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-[#002f65] p-6 text-white">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-white/65">Your progress</p>
            <p className="mt-1 text-3xl font-semibold">{progress.percentage}%</p>
            <p className="mt-1 text-xs text-white/55">{progress.completed} of {progress.total} required lessons complete</p>
            {deadlineLabel && (
              <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${deadlineColors[deadlineStatus]}`}>
                {deadlineLabel}
              </span>
            )}
          </div>
          {nextLesson ? (
            <Link
              href={`/courses/${courseId}/modules/${nextLesson.module.id}/lessons/${nextLesson.lesson.id}`}
              className="shrink-0 rounded-xl bg-[#007c8b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006b78]"
            >
              {progress.percentage === 0 ? "Start course" : "Continue learning"}
            </Link>
          ) : progress.percentage === 100 ? (
            <Link href="/certificates" className="shrink-0 rounded-xl bg-[#7bdcb5]/20 px-5 py-3 text-sm font-semibold text-[#7bdcb5] transition hover:bg-[#7bdcb5]/30">
              View certificate →
            </Link>
          ) : null}
        </div>
        <div className="mt-5 h-2 rounded-full bg-white/15">
          <div className="h-2 rounded-full bg-[#7bdcb5] transition-all" style={{ width: `${progress.percentage}%` }} />
        </div>
      </div>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-[#002f65]">Modules</h2>
          <span className="text-sm text-[#526b78]">{modules.length} modules</span>
        </div>
        {modules.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#9dd7de] bg-white p-10 text-center text-[#526b78]">
            Modules will appear here when the course curriculum is added.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {modules.map((mod, index) => {
              const mp = mod.progress;
              const isComplete = mp.total > 0 && mp.completed === mp.total;
              const isStarted = mp.completed > 0 && !isComplete;
              return (
                <Link
                  key={mod.id}
                  href={`/courses/${courseId}/modules/${mod.id}`}
                  className="flex items-center gap-5 rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"
                >
                  <span className="font-mono text-sm text-[#007c8b]">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[#002f65]">{mod.title}</h3>
                    {mod.description && <p className="mt-0.5 truncate text-sm text-[#526b78]">{mod.description}</p>}
                    {mp.total > 0 && (
                      <p className="mt-1 text-xs text-[#526b78]">{mp.completed} of {mp.total} lessons</p>
                    )}
                  </div>
                  {isComplete ? (
                    <span className="shrink-0 rounded-full bg-[#e4f7ec] px-3 py-1 text-xs font-semibold text-[#145c36]">Complete</span>
                  ) : isStarted ? (
                    <span className="shrink-0 rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-semibold text-[#007c8b]">In progress</span>
                  ) : (
                    <span className="shrink-0 text-[#007c8b]">→</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
