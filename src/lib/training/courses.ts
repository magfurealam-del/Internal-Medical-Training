import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  content_version: string;
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  content_path: string;
  sort_order: number;
  is_required: boolean;
};

export type TrainingProfile = { id: string; full_name: string | null; role: string };

export async function listCourses() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, slug, description, status, content_version")
    .eq("status", "published")
    .order("title");

  if (error) throw new Error(error.message);
  return (data ?? []) as Course[];
}

export async function listAllCourses() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, slug, description, status, content_version")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Course[];
}

export async function listTrainingProfiles() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("profiles").select("id, full_name, role").order("full_name");
  if (error) throw new Error(error.message);
  return (data ?? []) as TrainingProfile[];
}

export async function listEnrollmentReports() {
  const supabase = await createSupabaseServerClient();
  const [{ data: enrollments, error: enrollmentError }, { data: courses, error: courseError }, { data: profiles, error: profileError }] = await Promise.all([
    supabase.from("enrollments").select("id, user_id, course_id, status, assigned_at, expires_at, completed_at").order("assigned_at", { ascending: false }),
    supabase.from("courses").select("id, title"),
    supabase.from("profiles").select("id, full_name"),
  ]);
  if (enrollmentError) throw new Error(enrollmentError.message);
  if (courseError) throw new Error(courseError.message);
  if (profileError) throw new Error(profileError.message);
  const courseMap = new Map((courses ?? []).map((course) => [course.id, course.title]));
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name || "Unnamed user"]));
  return (enrollments ?? []).map((enrollment) => ({ ...enrollment, course_title: courseMap.get(enrollment.course_id) ?? "Unknown course", learner_name: profileMap.get(enrollment.user_id) ?? "Unknown learner" }));
}

export async function listProgressReports() {
  const supabase = await createSupabaseServerClient();
  const [{ data: enrollments, error: enrollmentError }, { data: lessons, error: lessonError }, { data: progress, error: progressError }, { data: attempts, error: attemptError }, { data: quizzes, error: quizError }, { data: courses, error: courseError }, { data: profiles, error: profileError }, { data: certificates, error: certificateError }] = await Promise.all([
    supabase.from("enrollments").select("id, user_id, course_id, status, completed_at"),
    supabase.from("lessons").select("id, modules!inner(course_id)").eq("is_required", true),
    supabase.from("lesson_progress").select("user_id, lesson_id").not("completed_at", "is", null),
    supabase.from("attempts").select("user_id, quiz_id, score_percentage, passed, submitted_at"),
    supabase.from("quizzes").select("id, course_id"),
    supabase.from("courses").select("id, title"),
    supabase.from("profiles").select("id, full_name"),
    supabase.from("certificates").select("user_id, course_id, issued_at"),
  ]);
  for (const error of [enrollmentError, lessonError, progressError, attemptError, quizError, courseError, profileError, certificateError]) if (error) throw new Error(error.message);
  const courseMap = new Map((courses ?? []).map((course) => [course.id, course.title]));
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name || "Unnamed user"]));
  const requiredByCourse = new Map<string, Set<string>>();
  for (const lesson of lessons ?? []) {
    const courseId = (lesson.modules as unknown as { course_id: string }).course_id;
    if (!requiredByCourse.has(courseId)) requiredByCourse.set(courseId, new Set());
    requiredByCourse.get(courseId)?.add(lesson.id);
  }
  const quizById = new Map((quizzes ?? []).map((quiz) => [quiz.id, quiz.course_id]));
  return (enrollments ?? []).map((enrollment) => {
    const required = requiredByCourse.get(enrollment.course_id) ?? new Set<string>();
    const completed = new Set((progress ?? []).filter((item) => item.user_id === enrollment.user_id && required.has(item.lesson_id)).map((item) => item.lesson_id)).size;
    const courseAttempts = (attempts ?? []).filter((attempt) => attempt.user_id === enrollment.user_id && quizById.get(attempt.quiz_id) === enrollment.course_id);
    const latestAttempt = courseAttempts.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0];
    const certificate = (certificates ?? []).find((item) => item.user_id === enrollment.user_id && item.course_id === enrollment.course_id);
    return { ...enrollment, learner_name: profileMap.get(enrollment.user_id) ?? "Unknown learner", course_title: courseMap.get(enrollment.course_id) ?? "Unknown course", lessons_completed: completed, lessons_total: required.size, progress_percentage: required.size ? Math.round((completed / required.size) * 100) : 0, latest_score: latestAttempt?.score_percentage ?? null, latest_passed: latestAttempt?.passed ?? null, certificate_issued_at: certificate?.issued_at ?? null };
  });
}

export async function getCourse(courseId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, slug, description, status, content_version")
    .eq("id", courseId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Course | null;
}

export async function listModules(courseId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("modules")
    .select("id, course_id, title, description, sort_order")
    .eq("course_id", courseId)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return (data ?? []) as Module[];
}

export async function getModule(moduleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("modules")
    .select("id, course_id, title, description, sort_order")
    .eq("id", moduleId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Module | null;
}

export async function listLessons(moduleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, module_id, title, slug, content_path, sort_order, is_required")
    .eq("module_id", moduleId)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return (data ?? []) as Lesson[];
}

export async function getLesson(lessonId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, module_id, title, slug, content_path, sort_order, is_required")
    .eq("id", lessonId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Lesson | null;
}

export async function getCourseProgress(courseId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { completed: 0, total: 0, percentage: 0 };

  const [{ data: lessons, error: lessonsError }, { data: progress, error: progressError }] = await Promise.all([
    supabase.from("lessons").select("id, modules!inner(course_id)").eq("modules.course_id", courseId).eq("is_required", true),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId).not("completed_at", "is", null),
  ]);

  if (lessonsError) throw new Error(lessonsError.message);
  if (progressError) throw new Error(progressError.message);
  const lessonIds = new Set((lessons ?? []).map((lesson) => lesson.id));
  const completed = (progress ?? []).filter((item) => lessonIds.has(item.lesson_id)).length;
  const total = lessonIds.size;
  return { completed, total, percentage: total === 0 ? 0 : Math.round((completed / total) * 100) };
}
