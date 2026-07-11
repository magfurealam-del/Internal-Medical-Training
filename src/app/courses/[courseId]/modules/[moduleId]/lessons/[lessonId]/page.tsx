import { markLessonComplete } from "@/app/actions/progress";
import { readLessonContent } from "@/lib/content/lessons";
import LessonContent from "./LessonContent";
import { notFound } from "next/navigation";
import { getCourse, getLesson, getModule } from "@/lib/training/courses";
import { LearningBreadcrumbs } from "@/components/LearningBreadcrumbs";

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }) {
  const { courseId, moduleId, lessonId } = await params;
  const [course, module, lesson] = await Promise.all([getCourse(courseId), getModule(moduleId), getLesson(lessonId)]);
  if (!course || !module || !lesson || module.course_id !== course.id || lesson.module_id !== module.id) notFound();
  const content = await readLessonContent(lesson.content_path);
  return <main className="mx-auto max-w-4xl px-6 py-16 lg:px-10"><LearningBreadcrumbs items={[{ label: "My learning", href: "/dashboard" }, { label: "Course catalogue", href: "/courses" }, { label: course.title, href: `/courses/${course.id}` }, { label: module.title, href: `/courses/${course.id}/modules/${module.id}` }, { label: lesson.title }]} /><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Lesson</p><h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">{lesson.title}</h1><section className="mt-10 rounded-2xl bg-white p-8 ring-1 ring-[#d5e9ed]">{content ? <LessonContent content={content} /> : <div className="rounded-xl border border-dashed border-[#9dd7de] p-8"><p className="font-semibold text-[#002f65]">Lesson content is ready to be added</p><p className="mt-3 text-sm leading-6 text-[#526b78]">Add Markdown at <code className="rounded bg-[#f6feff] px-1.5 py-1 text-[#007c8b]">content/{lesson.content_path}</code> and deploy it through GitHub.</p></div>}<form action={markLessonComplete} className="mt-10 border-t border-[#d5e9ed] pt-6"><input type="hidden" name="lessonId" value={lesson.id} /><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="moduleId" value={module.id} /><button className="rounded-xl bg-[#002f65] px-5 py-3 font-semibold text-white transition hover:bg-[#001f43]">Mark lesson complete</button></form></section></main>;
}
