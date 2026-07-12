import { markLessonComplete } from "@/app/actions/progress";
import { readLessonContent } from "@/lib/content/lessons";
import LessonContent from "./LessonContent";
import { notFound } from "next/navigation";
import { getCourse, getCompletedLessonIds, getLesson, getModule, listLessons } from "@/lib/training/courses";
import { LearningBreadcrumbs } from "@/components/LearningBreadcrumbs";

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }) {
  const { courseId, moduleId, lessonId } = await params;
  const [course, module, lesson, allLessons] = await Promise.all([
    getCourse(courseId),
    getModule(moduleId),
    getLesson(lessonId),
    listLessons(moduleId),
  ]);
  if (!course || !module || !lesson || module.course_id !== course.id || lesson.module_id !== module.id) notFound();

  const completedIds = await getCompletedLessonIds(allLessons.map((l) => l.id));
  const isComplete = completedIds.has(lesson.id);

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const content = await readLessonContent(lesson.content_path);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
      <LearningBreadcrumbs
        items={[
          { label: "My learning", href: "/dashboard" },
          { label: course.title, href: `/courses/${course.id}` },
          { label: module.title, href: `/courses/${course.id}/modules/${module.id}` },
          { label: lesson.title },
        ]}
      />

      {/* Lesson header */}
      <div className="mt-8">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-semibold text-[#007c8b]">
            Lesson {currentIndex + 1} of {allLessons.length}
          </span>
          {isComplete && (
            <span className="rounded-full bg-[#e4f7ec] px-3 py-1 text-xs font-semibold text-[#145c36]">✓ Complete</span>
          )}
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#002f65] sm:text-5xl">{lesson.title}</h1>
      </div>

      {/* Lesson content */}
      <article className="mt-8 rounded-2xl bg-white p-8 ring-1 ring-[#d5e9ed] lg:p-10">
        {content ? (
          <LessonContent content={content} />
        ) : (
          <div className="rounded-xl border border-dashed border-[#9dd7de] p-8 text-center">
            <p className="font-semibold text-[#002f65]">Lesson content is ready to be added</p>
            <p className="mt-3 text-sm leading-6 text-[#526b78]">
              Add Markdown at{" "}
              <code className="rounded bg-[#f6feff] px-1.5 py-1 text-[#007c8b]">content/{lesson.content_path}</code>{" "}
              and deploy through GitHub.
            </p>
          </div>
        )}
      </article>

      {/* Complete & navigate */}
      <div className="mt-8 rounded-2xl bg-[#f6feff] p-6 ring-1 ring-[#d5e9ed]">
        {isComplete ? (
          <div className="flex items-center gap-3 text-[#145c36]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e4f7ec] text-sm font-bold">✓</span>
            <p className="font-semibold">You have completed this lesson.</p>
          </div>
        ) : (
          <form action={markLessonComplete} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input type="hidden" name="lessonId" value={lesson.id} />
            <input type="hidden" name="courseId" value={course.id} />
            <input type="hidden" name="moduleId" value={module.id} />
            <div>
              <p className="font-semibold text-[#002f65]">Finished reading?</p>
              <p className="mt-1 text-sm text-[#526b78]">Mark this lesson complete to track your progress.</p>
            </div>
            <button className="shrink-0 rounded-xl bg-[#002f65] px-6 py-3 font-semibold text-white transition hover:bg-[#001f43]">
              Mark complete →
            </button>
          </form>
        )}
      </div>

      {/* Prev / Next navigation */}
      <nav className="mt-6 grid grid-cols-2 gap-3" aria-label="Lesson navigation">
        {prevLesson ? (
          <a
            href={`/courses/${courseId}/modules/${moduleId}/lessons/${prevLesson.id}`}
            className="flex flex-col rounded-2xl bg-white p-4 ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"
          >
            <span className="text-xs font-semibold text-[#526b78]">← Previous</span>
            <span className="mt-1 font-semibold text-[#002f65] line-clamp-2">{prevLesson.title}</span>
          </a>
        ) : (
          <a
            href={`/courses/${courseId}/modules/${moduleId}`}
            className="flex flex-col rounded-2xl bg-white p-4 ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"
          >
            <span className="text-xs font-semibold text-[#526b78]">← Back to module</span>
            <span className="mt-1 font-semibold text-[#002f65]">{module.title}</span>
          </a>
        )}

        {nextLesson ? (
          <a
            href={`/courses/${courseId}/modules/${moduleId}/lessons/${nextLesson.id}`}
            className="flex flex-col rounded-2xl bg-white p-4 ring-1 ring-[#d5e9ed] text-right transition hover:ring-[#007c8b]"
          >
            <span className="text-xs font-semibold text-[#526b78]">Next →</span>
            <span className="mt-1 font-semibold text-[#002f65] line-clamp-2">{nextLesson.title}</span>
          </a>
        ) : (
          <a
            href={`/courses/${courseId}/modules/${moduleId}`}
            className="flex flex-col rounded-2xl bg-[#edf7f8] p-4 ring-1 ring-[#c7e7ea] text-right transition hover:ring-[#007c8b]"
          >
            <span className="text-xs font-semibold text-[#007c8b]">Module complete →</span>
            <span className="mt-1 font-semibold text-[#002f65]">Back to module overview</span>
          </a>
        )}
      </nav>
    </main>
  );
}
