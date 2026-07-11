import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, listModules } from "@/lib/training/courses";

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const [course, modules] = await Promise.all([getCourse(courseId), listModules(courseId)]);
  if (!course) notFound();

  return <main className="mx-auto max-w-5xl px-6 py-16 lg:px-10"><Link href="/courses" className="text-sm font-medium text-[#007c8b]">← All courses</Link><p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Course overview</p><h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">{course.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#526b78]">{course.description ?? "Course description coming soon."}</p><section className="mt-12"><div className="flex items-end justify-between"><h2 className="text-2xl font-semibold text-[#002f65]">Modules</h2><span className="text-sm text-[#526b78]">{modules.length} modules</span></div>{modules.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-[#9dd7de] bg-white p-10 text-center text-[#526b78]">Modules will appear here when the course curriculum is added.</div> : <div className="mt-5 space-y-3">{modules.map((module, index) => <Link key={module.id} href={`/courses/${course.id}/modules/${module.id}`} className="flex items-center gap-5 rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"><span className="font-mono text-sm text-[#007c8b]">{String(index + 1).padStart(2, "0")}</span><div><h3 className="font-semibold text-[#002f65]">{module.title}</h3><p className="mt-1 text-sm text-[#526b78]">{module.description ?? "Module content"}</p></div><span className="ml-auto text-[#007c8b]">→</span></Link>)}</div>}</section></main>;
}
