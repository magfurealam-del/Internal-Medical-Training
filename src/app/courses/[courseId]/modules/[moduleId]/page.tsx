import Link from "next/link";
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
  const [{ data: quiz }, { data: claims }] = await Promise.all([supabase.from("quizzes").select("id, title").eq("module_id", module.id).maybeSingle(), supabase.auth.getClaims()]);
  const userId = claims?.claims?.sub;
  const { data: progress } = userId ? await supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId).in("lesson_id", lessons.map((lesson) => lesson.id)).not("completed_at", "is", null) : { data: [] };
  return <main className="mx-auto max-w-5xl px-6 py-16 lg:px-10"><LearningBreadcrumbs items={[{ label: "My learning", href: "/dashboard" }, { label: "Course catalogue", href: "/courses" }, { label: course.title, href: `/courses/${course.id}` }, { label: module.title }]} /><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Module</p><h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">{module.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#526b78]">{module.description ?? "Module description coming soon."}</p><section className="mt-12"><h2 className="text-2xl font-semibold text-[#002f65]">Lessons</h2>{lessons.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-[#9dd7de] bg-white p-10 text-center text-[#526b78]">Lessons will appear here when content is added.</div> : <LessonList courseId={course.id} moduleId={module.id} lessons={lessons} completedIds={(progress ?? []).map((item) => item.lesson_id)} />}{quiz && <Link href={`/quiz/${quiz.id}`} className="mt-8 flex items-center justify-between rounded-2xl bg-[#002f65] p-5 text-white"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7bdcb5]">Next stage</p><h3 className="mt-2 text-lg font-semibold">{quiz.title}</h3></div><span>Start assessment →</span></Link>}</section></main>;
}
