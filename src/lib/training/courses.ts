import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  content_version: string;
  audience_groups?: AudienceGroup[];
  enrollment?: Enrollment | null;
};

export type Enrollment = {
  id: string;
  status: string;
  expires_at: string | null;
  completed_at: string | null;
};

export type AudienceGroup = { id: string; name: string; slug: string };

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
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  const { data, error } = await supabase
    .from("courses")
    .select("id, title, slug, description, status, content_version")
    .eq("status", "published")
    .order("title");

  if (error) throw new Error(error.message);
  const courses = data ?? [];

  if (!userId) return courses as Course[];

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, course_id, status, expires_at, completed_at")
    .eq("user_id", userId)
    .in("course_id", courses.map((c) => c.id));

  const enrollmentByCourse = new Map((enrollments ?? []).map((e) => [e.course_id, e]));
  return courses.map((course) => ({
    ...course,
    enrollment: enrollmentByCourse.get(course.id) ?? null,
  })) as Course[];
}

export async function listAudienceGroups() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("audience_groups").select("id, name, slug").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as AudienceGroup[];
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
    supabase.from("enrollments").select("id, user_id, course_id, status, expires_at, completed_at"),
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
    const progressPercentage = required.size ? Math.round((completed / required.size) * 100) : 0;
    const expiresAt = enrollment.expires_at;
    const daysUntilExpiry = expiresAt ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000) : null;
    const atRisk = progressPercentage < 100 && daysUntilExpiry !== null && daysUntilExpiry <= 14;
    return { ...enrollment, learner_name: profileMap.get(enrollment.user_id) ?? "Unknown learner", course_title: courseMap.get(enrollment.course_id) ?? "Unknown course", lessons_completed: completed, lessons_total: required.size, progress_percentage: progressPercentage, latest_score: latestAttempt?.score_percentage ?? null, latest_passed: latestAttempt?.passed ?? null, certificate_issued_at: certificate?.issued_at ?? null, days_until_expiry: daysUntilExpiry, at_risk: atRisk };
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

export async function getNextLesson(courseId: string): Promise<{ lesson: Lesson; module: Module } | null> {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return null;

  const [{ data: modules }, { data: progress }] = await Promise.all([
    supabase.from("modules").select("id, course_id, title, description, sort_order").eq("course_id", courseId).order("sort_order"),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId).not("completed_at", "is", null),
  ]);

  const completedIds = new Set((progress ?? []).map((p) => p.lesson_id));
  for (const mod of modules ?? []) {
    const { data: lessons } = await supabase.from("lessons").select("id, module_id, title, slug, content_path, sort_order, is_required").eq("module_id", mod.id).order("sort_order");
    const next = (lessons ?? []).find((l) => !completedIds.has(l.id));
    if (next) return { lesson: next as Lesson, module: mod as Module };
  }
  return null;
}

export async function getModuleProgress(moduleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { completed: 0, total: 0 };

  const [{ data: lessons }, { data: progress }] = await Promise.all([
    supabase.from("lessons").select("id").eq("module_id", moduleId).eq("is_required", true),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId).not("completed_at", "is", null),
  ]);

  const ids = new Set((lessons ?? []).map((l) => l.id));
  const completed = (progress ?? []).filter((p) => ids.has(p.lesson_id)).length;
  return { completed, total: ids.size };
}

export async function getCompletedLessonIds(lessonIds: string[]): Promise<Set<string>> {
  if (!lessonIds.length) return new Set();
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return new Set();
  const { data } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId).in("lesson_id", lessonIds).not("completed_at", "is", null);
  return new Set((data ?? []).map((p) => p.lesson_id));
}

export async function getPreviousAttempt(quizId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return null;
  const { data } = await supabase.from("attempts").select("score_percentage, passed, submitted_at").eq("quiz_id", quizId).eq("user_id", userId).order("submitted_at", { ascending: false }).limit(1);
  return (data ?? [])[0] ?? null;
}

export async function listCertificates() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("certificates").select("id, certificate_number, course_id, issued_at").order("issued_at", { ascending: false });
  if (error) throw new Error(error.message);
  const courseIds = (data ?? []).map((certificate) => certificate.course_id);
  const { data: courses, error: courseError } = courseIds.length ? await supabase.from("courses").select("id, title").in("id", courseIds) : { data: [], error: null };
  if (courseError) throw new Error(courseError.message);
  const courseMap = new Map((courses ?? []).map((course) => [course.id, course.title]));
  return (data ?? []).map((certificate) => ({ ...certificate, course_title: courseMap.get(certificate.course_id) ?? "Training course" }));
}
