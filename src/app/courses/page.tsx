import Link from "next/link";
import { listCourses } from "@/lib/training/courses";

export default async function CoursesPage() {
  const courses = await listCourses();

  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Learning catalogue</p><h1 className="mt-3 text-5xl font-semibold tracking-tight">Courses</h1><p className="mt-4 max-w-xl text-[#526b78]">Your assigned training will appear here as courses are published.</p>{courses.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-[#9dd7de] bg-white p-12 text-center"><p className="font-semibold text-[#002f65]">No published courses yet</p><p className="mt-2 text-sm text-[#526b78]">The platform is ready for the first course and its modules.</p></div> : <div className="mt-10 grid gap-5 md:grid-cols-2">{courses.map((course) => <Link key={course.id} href={`/courses/${course.id}`} className="rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed] transition hover:-translate-y-0.5 hover:ring-[#007c8b]"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#007c8b]">Version {course.content_version}</p><h2 className="mt-3 text-2xl font-semibold text-[#002f65]">{course.title}</h2><p className="mt-3 text-sm leading-6 text-[#526b78]">{course.description ?? "Training course"}</p></Link>)}</div>}</main>;
}
