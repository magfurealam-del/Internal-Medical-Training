import Link from "next/link";
import type { Lesson } from "@/lib/training/courses";

export default function LessonList({ courseId, moduleId, lessons, completedIds }: { courseId: string; moduleId: string; lessons: Lesson[]; completedIds: string[] }) {
  const completed = new Set(completedIds);
  return <div className="mt-5 flex flex-col gap-3">{lessons.map((lesson, index) => <Link key={lesson.id} href={`/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`} className="flex items-center gap-5 rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"><span className="font-mono text-sm text-[#007c8b]">{String(index + 1).padStart(2, "0")}</span><span className="font-semibold text-[#002f65]">{lesson.title}</span>{completed.has(lesson.id) ? <span className="ml-auto text-xs font-semibold text-[#007c8b]">Complete</span> : lesson.is_required && <span className="ml-auto text-xs text-[#526b78]">Required</span>}</Link>)}</div>;
}
