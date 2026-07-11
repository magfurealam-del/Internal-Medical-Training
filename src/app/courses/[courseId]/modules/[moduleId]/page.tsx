import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, getModule, listLessons } from "@/lib/training/courses";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ModulePage({ params }: { params: Promise<{ courseId: string; moduleId: string }> }) {
  const { courseId, moduleId } = await params;
  const [course, module, lessons] = await Promise.all([getCourse(courseId), getModule(moduleId), listLessons(moduleId)]);
  if (!course || !module || module.course_id !== course.id) notFound();
  const supabase = await createSupabaseServerClient();
  const { data: quiz } = await supabase.from("quizzes").select("id, title").eq("module_id", module.id).maybeSingle();

  return <main className="mx-auto max-w-5xl px-6 py-16 lg:px-10"><Link href={`/courses/${course.id}`} className="text-sm font-medium text-[#007c8b]">← {course.title}</Link><p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Module</p><h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">{module.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#526b78]">{module.description ?? "Module description coming soon."}</p><section className="mt-12"><h2 className="text-2xl font-semibold text-[#002f65]">Lessons</h2>{lessons.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-[#9dd7de] bg-white p-10 text-center text-[#526b78]">Lessons will appear here when content is added.</div> : <div className="mt-5 space-y-3">{lessons.map((lesson, index) => <Link key={lesson.id} href={`/courses/${course.id}/modules/${module.id}/lessons/${lesson.id}`} className="flex items-center gap-5 rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"><span className="font-mono text-sm text-[#007c8b]">{String(index + 1).padStart(2, "0")}</span><span className="font-semibold text-[#002f65]">{lesson.title}</span>{lesson.is_required && <span className="ml-auto text-xs text-[#526b78]">Required</span>}</Link>)}</div>}{quiz && <Link href={`/quiz/${quiz.id}`} className="mt-8 flex items-center justify-between rounded-2xl bg-[#002f65] p-5 text-white"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7bdcb5]">Next stage</p><h3 className="mt-2 text-lg font-semibold">{quiz.title}</h3></div><span>Start assessment →</span></Link>}</section></main>;
}
