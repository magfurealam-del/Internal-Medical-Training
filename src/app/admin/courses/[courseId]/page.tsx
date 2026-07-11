import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, listLessons, listModules, listTrainingProfiles } from "@/lib/training/courses";
import ModuleCreateForm from "@/app/admin/ModuleCreateForm";
import LessonCreateForm from "@/app/admin/LessonCreateForm";
import EnrollmentForm from "@/app/admin/EnrollmentForm";
import { requireTrainingStaff } from "@/lib/training/auth";

export default async function AdminCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  await requireTrainingStaff();
  const { courseId } = await params;
  const [course, modules, profiles] = await Promise.all([getCourse(courseId), listModules(courseId), listTrainingProfiles()]);
  if (!course) notFound();
  const modulesWithLessons = await Promise.all(modules.map(async (module) => ({ module, lessons: await listLessons(module.id) })));
  return <main className="mx-auto max-w-5xl px-6 py-16 lg:px-10"><Link href="/admin" className="text-sm font-medium text-[#007c8b]">← Administration</Link><div className="mt-10 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Course management</p><h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">{course.title}</h1><p className="mt-3 text-[#526b78]">{course.description ?? "No description yet."}</p></div><span className="rounded-full bg-[#d9f2f4] px-4 py-2 text-sm font-medium text-[#007c8b]">{course.status}</span></div><section className="mt-12 rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]"><div className="flex items-center justify-between"><h2 className="text-2xl font-semibold text-[#002f65]">Modules and lessons</h2><span className="text-sm text-[#526b78]">{modules.length} modules</span></div>{modulesWithLessons.length === 0 && <p className="mt-6 text-sm text-[#526b78]">No modules yet. Create the first one below.</p>}<div className="mt-6 space-y-5">{modulesWithLessons.map(({ module, lessons }) => <div key={module.id} className="rounded-xl border border-[#d5e9ed] p-5"><h3 className="font-semibold text-[#002f65]">{module.title}</h3><p className="mt-1 text-sm text-[#526b78]">{module.description}</p><div className="mt-4 space-y-2">{lessons.map((lesson) => <div key={lesson.id} className="rounded-lg bg-[#f6feff] px-4 py-3 text-sm"><span className="font-medium text-[#002f65]">{lesson.title}</span><span className="ml-3 text-[#526b78]">{lesson.content_path}</span></div>)}<LessonCreateForm courseId={course.id} moduleId={module.id} /></div></div>)}</div><div className="mt-8 border-t border-[#d5e9ed] pt-6"><h3 className="font-semibold text-[#002f65]">Add module</h3><ModuleCreateForm courseId={course.id} /></div></section><section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]"><h2 className="text-2xl font-semibold text-[#002f65]">Assign learners</h2><p className="mt-2 text-sm text-[#526b78]">Assign this course to a training user, optionally with an expiry date.</p><EnrollmentForm courseId={course.id} profiles={profiles} /></section></main>;
}
