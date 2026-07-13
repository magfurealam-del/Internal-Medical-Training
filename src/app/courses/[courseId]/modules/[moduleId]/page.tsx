import { notFound } from "next/navigation";
import { getCourse, getModule, listLessons } from "@/lib/training/courses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LearningBreadcrumbs } from "@/components/LearningBreadcrumbs";
import LessonList from "./LessonList";

export default async function ModulePage({ params }: { params: Promise<{ courseId: string; moduleId: string }> }) {
  const { courseId, moduleId } = await params;
  const [course, module, lessons] = await Promise.all([getCourse(courseId), getModule(moduleId), listLessons(moduleId)]);
  if (!course || !module || module.course_id !== course.id) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  const isSignedIn = Boolean(userId);

  const lessonIds = lessons.map((l) => l.id);
  const [{ data: quiz }, { data: progressRows }] = await Promise.all([
    supabase.from("quizzes").select("id, title").eq("module_id", module.id).maybeSingle(),
    userId && lessonIds.length
      ? supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId).in("lesson_id", lessonIds).not("completed_at", "is", null)
      : Promise.resolve({ data: [] }),
  ]);

  const completedIds = new Set((progressRows ?? []).map((p) => p.lesson_id));
  const requiredTotal = lessons.filter((l) => l.is_required).length;
  const requiredCompleted = lessons.filter((l) => l.is_required && completedIds.has(l.id)).length;
  const allLessonsComplete = requiredTotal > 0 && requiredCompleted === requiredTotal;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      <LearningBreadcrumbs
        items={[
          { label: "My learning", href: "/dashboard" },
          { label: "Course catalogue", href: "/courses" },
          { label: course.title, href: `/courses/${course.id}` },
          { label: module.title },
        ]}
      />

      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Module</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">{module.title}</h1>
      {module.description && <p className="mt-5 max-w-2xl text-lg leading-8 text-[#526b78]">{module.description}</p>}

      <div className="mt-6 flex items-center gap-4">
        <div className="h-2 flex-1 rounded-full bg-[#d9f2f4]">
          <div
            className="h-2 rounded-full bg-[#007c8b] transition-all"
            style={{ width: requiredTotal > 0 ? `${Math.round((requiredCompleted / requiredTotal) * 100)}%` : "0%" }}
          />
        </div>
        <span className="shrink-0 text-sm font-medium text-[#526b78]">
          {requiredCompleted} / {requiredTotal} lessons
        </span>
        {allLessonsComplete && <span className="shrink-0 rounded-full bg-[#e4f7ec] px-3 py-1 text-xs font-semibold text-[#145c36]">Complete</span>}
      </div>

      <section className="mt-10">
        {!isSignedIn && <div className="mb-6 rounded-2xl border border-[#c7e7ea] bg-[#edf7f8] p-5 text-sm leading-6 text-[#345d68]">Public preview mode: lessons are open to read. Progress tracking and assessments will return when sign-in is re-enabled.</div>}
        <h2 className="text-xl font-semibold text-[#002f65]">Lessons</h2>
        {lessons.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#9dd7de] bg-white p-10 text-center text-[#526b78]">
            Lessons will appear here when content is added.
          </div>
        ) : (
          <LessonList
            courseId={course.id}
            moduleId={module.id}
            lessons={lessons}
            completedIds={Array.from(completedIds)}
            quizId={quiz?.id}
          />
        )}
      </section>
    </main>
  );
}
