import Link from "next/link";
import { getCourseProgress, listCourses } from "@/lib/training/courses";

export default async function DashboardPage() {
  const courses = await listCourses();
  const coursesWithProgress = await Promise.all(courses.map(async (course) => ({ course, progress: await getCourseProgress(course.id) })));

  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Learner area</p><h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">Your dashboard</h1><p className="mt-4 max-w-xl text-[#526b78]">Continue assigned learning and keep track of your course progress.</p>{coursesWithProgress.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-[#9dd7de] bg-white p-10 text-center text-[#526b78]">No courses assigned yet.</div> : <div className="mt-10 grid gap-5 md:grid-cols-2">{coursesWithProgress.map(({ course, progress }) => <Link key={course.id} href={`/courses/${course.id}`} className="rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"><h2 className="text-2xl font-semibold text-[#002f65]">{course.title}</h2><div className="mt-6 flex justify-between text-sm text-[#526b78]"><span>Progress</span><span>{progress.percentage}%</span></div><div className="mt-2 h-2 rounded-full bg-[#d9f2f4]"><div className="h-2 rounded-full bg-[#007c8b]" style={{ width: `${progress.percentage}%` }} /></div><p className="mt-3 text-xs text-[#526b78]">{progress.completed} of {progress.total} required lessons complete</p></Link>)}</div>}</main>;
}
