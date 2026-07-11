import Link from "next/link";
import { markLessonComplete } from "@/app/actions/progress";
import { notFound } from "next/navigation";
import { getCourse, getLesson, getModule } from "@/lib/training/courses";

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }) {
  const { courseId, moduleId, lessonId } = await params;
  const [course, module, lesson] = await Promise.all([getCourse(courseId), getModule(moduleId), getLesson(lessonId)]);
  if (!course || !module || !lesson || module.course_id !== course.id || lesson.module_id !== module.id) notFound();

  return <main className="mx-auto max-w-4xl px-6 py-16 lg:px-10"><Link href={`/courses/${course.id}/modules/${module.id}`} className="text-sm font-medium text-[#007c8b]">← {module.title}</Link><p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Lesson</p><h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">{lesson.title}</h1><div className="mt-10 rounded-2xl border border-dashed border-[#9dd7de] bg-white p-10"><p className="font-semibold text-[#002f65]">Lesson content is ready to be connected</p><p className="mt-3 text-sm leading-6 text-[#526b78]">This lesson is mapped to <code className="rounded bg-[#f6feff] px-1.5 py-1 text-[#007c8b]">{lesson.content_path}</code>. The next content step will load Markdown/MDX from GitHub.</p><form action={markLessonComplete} className="mt-8"><input type="hidden" name="lessonId" value={lesson.id} /><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="moduleId" value={module.id} /><button className="rounded-xl bg-[#002f65] px-5 py-3 font-semibold text-white transition hover:bg-[#001f43]">Mark lesson complete</button></form></div></main>;
}
