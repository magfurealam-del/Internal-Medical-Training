import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, listAudienceGroups, listLessons, listModules, listQuizzes, listTrainingProfiles } from "@/lib/training/courses";
import { requireTrainingStaff } from "@/lib/training/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ModuleCreateForm from "@/app/admin/ModuleCreateForm";
import LessonCreateForm from "@/app/admin/LessonCreateForm";
import EnrollmentForm from "@/app/admin/EnrollmentForm";
import BulkEnrollmentForm from "@/app/admin/BulkEnrollmentForm";
import CourseStatusForm from "@/app/admin/CourseStatusForm";
import QuizCreateForm from "@/app/admin/QuizCreateForm";
import { UpdateDeadlineForm, UnenrollButton } from "@/app/admin/EnrollmentRowActions";
import { EditCourseForm, EditModuleForm, EditLessonForm } from "@/app/admin/EditForms";
import { ModuleControls, LessonControls } from "@/app/admin/DeleteButtons";
import { formatDeadline, getDeadlineStatus, deadlineColors } from "@/lib/training/deadlines";

export default async function AdminCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  await requireTrainingStaff();
  const { courseId } = await params;
  const [course, modules, profiles, audienceGroups] = await Promise.all([
    getCourse(courseId),
    listModules(courseId),
    listTrainingProfiles(),
    listAudienceGroups(),
  ]);
  const quizzes = course ? await listQuizzes(courseId) : [];
  if (!course) notFound();

  const modulesWithLessons = await Promise.all(
    modules.map(async (mod) => ({ module: mod, lessons: await listLessons(mod.id) })),
  );

  // Fetch current enrollments for this course
  const supabase = await createSupabaseServerClient();
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, user_id, status, expires_at, completed_at, assigned_at")
    .eq("course_id", courseId)
    .order("assigned_at", { ascending: false });

  const profileMap = new Map(profiles.map((p) => [p.id, p.full_name || "Unnamed user"]));

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      <Link href="/admin" className="text-sm font-medium text-[#007c8b]">← Administration</Link>

      <div className="mt-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Course management</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">{course.title}</h1>
          <p className="mt-3 text-[#526b78]">{course.description ?? "No description yet."}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-[#d9f2f4] px-4 py-2 text-sm font-medium text-[#007c8b]">{course.status}</span>
          <CourseStatusForm courseId={course.id} status={course.status} />
          <EditCourseForm courseId={course.id} title={course.title} description={course.description} />
        </div>
      </div>

      {/* Modules & lessons */}
      <section className="mt-12 rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#002f65]">Modules and lessons</h2>
          <span className="text-sm text-[#526b78]">{modules.length} modules</span>
        </div>
        {modulesWithLessons.length === 0 && (
          <p className="mt-6 text-sm text-[#526b78]">No modules yet. Create the first one below.</p>
        )}
        <div className="mt-6 space-y-5">
          {modulesWithLessons.map(({ module: mod, lessons }, modIdx) => (
            <div key={mod.id} className="rounded-xl border border-[#d5e9ed] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#002f65]">{mod.title}</h3>
                  {mod.description && <p className="mt-1 text-sm text-[#526b78]">{mod.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ModuleControls
                    moduleId={mod.id}
                    courseId={courseId}
                    isFirst={modIdx === 0}
                    isLast={modIdx === modulesWithLessons.length - 1}
                  />
                  <EditModuleForm
                    moduleId={mod.id}
                    courseId={courseId}
                    title={mod.title}
                    description={mod.description}
                    sortOrder={mod.sort_order}
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {lessons.map((lesson, lessonIdx) => (
                  <div key={lesson.id} className="flex items-center justify-between rounded-lg bg-[#f6feff] px-4 py-3 text-sm">
                    <div className="min-w-0">
                      <span className="font-medium text-[#002f65]">{lesson.title}</span>
                      <span className="ml-3 truncate text-[#526b78]">{lesson.content_path}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <LessonControls
                        lessonId={lesson.id}
                        moduleId={mod.id}
                        courseId={courseId}
                        isFirst={lessonIdx === 0}
                        isLast={lessonIdx === lessons.length - 1}
                      />
                      <EditLessonForm
                        lessonId={lesson.id}
                        courseId={courseId}
                        title={lesson.title}
                        contentPath={lesson.content_path}
                        sortOrder={lesson.sort_order}
                      />
                    </div>
                  </div>
                ))}
                <LessonCreateForm courseId={course.id} moduleId={mod.id} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-[#d5e9ed] pt-6">
          <h3 className="font-semibold text-[#002f65]">Add module</h3>
          <ModuleCreateForm courseId={course.id} />
        </div>
      </section>

      {/* Quizzes */}
      <section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#002f65]">Assessments</h2>
          <span className="text-sm text-[#526b78]">{quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}</span>
        </div>

        {quizzes.length > 0 && (
          <div className="mt-5 space-y-3">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between rounded-xl border border-[#d5e9ed] p-4">
                <div>
                  <p className="font-semibold text-[#002f65]">{quiz.title}</p>
                  <p className="mt-0.5 text-xs text-[#526b78]">Pass mark: {quiz.pass_percentage}%</p>
                </div>
                <Link
                  href={`/admin/courses/${courseId}/quizzes/${quiz.id}`}
                  className="rounded-xl bg-[#edf7f8] px-4 py-2 text-sm font-semibold text-[#007c8b] transition hover:bg-[#d9f2f4]"
                >
                  Manage →
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className={`${quizzes.length > 0 ? "mt-6 border-t border-[#d5e9ed] pt-6" : "mt-4"}`}>
          <h3 className="font-semibold text-[#002f65]">Create quiz</h3>
          <p className="mt-1 text-sm text-[#526b78]">Create an assessment, then add questions and answer choices inside it.</p>
          <QuizCreateForm courseId={course.id} />
        </div>
      </section>

      {/* Enrollment management */}
      <section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]">
        <h2 className="text-2xl font-semibold text-[#002f65]">Enrolment</h2>

        {/* Individual enroll */}
        <div className="mt-6">
          <h3 className="font-semibold text-[#002f65]">Assign individual learner</h3>
          <p className="mt-1 text-sm text-[#526b78]">Enrol one person, optionally with a completion deadline.</p>
          <EnrollmentForm courseId={course.id} profiles={profiles} />
        </div>

        {/* Bulk enroll by group */}
        <div className="mt-8 border-t border-[#d5e9ed] pt-6">
          <h3 className="font-semibold text-[#002f65]">Enrol by audience group</h3>
          <p className="mt-1 text-sm text-[#526b78]">
            Enrol all platform users at once, grouped by role. Set a shared deadline if needed.
          </p>
          <BulkEnrollmentForm courseId={course.id} groups={audienceGroups} />
        </div>

        {/* Current enrollments table */}
        {enrollments && enrollments.length > 0 && (
          <div className="mt-8 border-t border-[#d5e9ed] pt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#002f65]">Current enrolments</h3>
              <span className="text-sm text-[#526b78]">{enrollments.length} learner{enrollments.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#d5e9ed]">
              <table className="w-full text-sm">
                <thead className="bg-[#f6feff]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-[#002f65]">Learner</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#002f65]">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#002f65]">Deadline</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#002f65]">Completed</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#002f65]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => {
                    const deadlineLabel = formatDeadline(enrollment.expires_at);
                    const deadlineStatus = getDeadlineStatus(enrollment.expires_at);
                    return (
                      <tr key={enrollment.id} className="border-t border-[#d5e9ed]">
                        <td className="px-4 py-3 font-medium text-[#002f65]">
                          {profileMap.get(enrollment.user_id) ?? "Unknown"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            enrollment.status === "completed" ? "bg-[#e4f7ec] text-[#145c36]" :
                            enrollment.status === "active" ? "bg-[#edf7f8] text-[#007c8b]" :
                            "bg-[#f6f6f6] text-[#526b78]"
                          }`}>
                            {enrollment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {deadlineLabel ? (
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${deadlineColors[deadlineStatus]}`}>
                              {deadlineLabel}
                            </span>
                          ) : (
                            <span className="text-[#b0c8d0]">No deadline</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#526b78]">
                          {enrollment.completed_at
                            ? new Date(enrollment.completed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                            : <span className="text-[#b0c8d0]">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <UpdateDeadlineForm
                              enrollmentId={enrollment.id}
                              courseId={courseId}
                              currentExpiry={enrollment.expires_at}
                            />
                            {enrollment.status !== "completed" && (
                              <UnenrollButton enrollmentId={enrollment.id} courseId={courseId} />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
