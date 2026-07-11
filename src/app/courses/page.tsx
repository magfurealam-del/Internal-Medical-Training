import { getCourseProgress, listCourses } from "@/lib/training/courses";
import CourseCatalogue from "./CourseCatalogue";

export default async function CoursesPage() {
  const courses = await listCourses();
  const coursesWithProgress = await Promise.all(courses.map(async (course) => ({ ...course, progress: await getCourseProgress(course.id) })));

  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Learning catalogue</p><h1 className="mt-3 text-5xl font-semibold">Courses</h1><p className="mt-4 max-w-xl text-[#526b78]">Your assigned training will appear here as courses are published.</p>{courses.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-[#9dd7de] bg-white p-12 text-center"><p className="font-semibold text-[#002f65]">No published courses yet</p><p className="mt-2 text-sm text-[#526b78]">The platform is ready for the first course and its modules.</p></div> : <CourseCatalogue courses={coursesWithProgress} />}</main>;
}
