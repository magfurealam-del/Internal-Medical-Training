import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, listModules } from "@/lib/training/courses";

export default async function AdminCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const [course, modules] = await Promise.all([getCourse(courseId), listModules(courseId)]);
  if (!course) notFound();
  return <main className="mx-auto max-w-5xl px-6 py-16 lg:px-10"><Link href="/admin" className="text-sm font-medium text-[#007c8b]">← Administration</Link><div className="mt-10 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Course management</p><h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">{course.title}</h1><p className="mt-3 text-[#526b78]">{course.description ?? "No description yet."}</p></div><span className="rounded-full bg-[#d9f2f4] px-4 py-2 text-sm font-medium text-[#007c8b]">{course.status}</span></div><section className="mt-12 rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]"><h2 className="text-2xl font-semibold text-[#002f65]">Modules</h2>{modules.length === 0 ? <p className="mt-6 rounded-xl bg-[#f6feff] p-6 text-sm text-[#526b78]">No modules yet. The next admin slice will add module management.</p> : <div className="mt-6 space-y-3">{modules.map((module) => <div key={module.id} className="rounded-xl border border-[#d5e9ed] p-4"><h3 className="font-semibold text-[#002f65]">{module.title}</h3><p className="mt-1 text-sm text-[#526b78]">{module.description}</p></div>)}</div>}</section></main>;
}
