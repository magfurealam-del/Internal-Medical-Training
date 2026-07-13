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
    supabase.from("enrollments").select("id, user_id, course_id, status, expires_at, completed_at, assigned_at"),
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

export async function getAttemptCount(quizId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return 0;
  const { count } = await supabase.from("attempts").select("*", { count: "exact", head: true }).eq("quiz_id", quizId).eq("user_id", userId);
  return count ?? 0;
}

export type Quiz = { id: string; course_id: string; module_id: string | null; title: string; pass_percentage: number; sort_order: number };
export type Question = { id: string; quiz_id: string; prompt: string; explanation: string | null; correct_choice_id: string | null; sort_order: number };
export type Choice = { id: string; question_id: string; choice_text: string; sort_order: number };

export async function listQuizzes(courseId: string): Promise<Quiz[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("id, course_id, module_id, title, pass_percentage, sort_order")
    .eq("course_id", courseId)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Quiz[];
}

export async function getQuizWithQuestions(quizId: string) {
  const supabase = await createSupabaseServerClient();
  const [{ data: quiz, error: quizError }, { data: questions, error: qError }] = await Promise.all([
    supabase.from("quizzes").select("id, course_id, module_id, title, pass_percentage, sort_order").eq("id", quizId).maybeSingle(),
    supabase.from("questions").select("id, quiz_id, prompt, explanation, correct_choice_id, sort_order").eq("quiz_id", quizId).order("sort_order"),
  ]);
  if (quizError) throw new Error(quizError.message);
  if (qError) throw new Error(qError.message);
  if (!quiz) return null;

  const questionIds = (questions ?? []).map((q) => q.id);
  const { data: choices } = questionIds.length
    ? await supabase.from("question_choices").select("id, question_id, choice_text, sort_order").in("question_id", questionIds).order("sort_order")
    : { data: [] };

  const choicesByQuestion = new Map<string, Choice[]>();
  for (const c of choices ?? []) {
    if (!choicesByQuestion.has(c.question_id)) choicesByQuestion.set(c.question_id, []);
    choicesByQuestion.get(c.question_id)!.push(c as Choice);
  }

  return {
    quiz: quiz as Quiz,
    questions: (questions ?? []).map((q) => ({
      ...(q as Question),
      choices: choicesByQuestion.get(q.id) ?? [],
    })),
  };
}

export async function getLearnerDetail(userId: string) {
  const supabase = await createSupabaseServerClient();

  const [
    { data: profile },
    { data: enrollments },
    { data: progress },
    { data: attempts },
    { data: certificates },
    { data: courses },
    { data: allLessons },
    { data: allModules },
    { data: allQuizzes },
  ] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role").eq("id", userId).maybeSingle(),
    supabase.from("enrollments").select("id, course_id, status, expires_at, completed_at, assigned_at").eq("user_id", userId),
    supabase.from("lesson_progress").select("lesson_id, completed_at").eq("user_id", userId).not("completed_at", "is", null),
    supabase.from("attempts").select("id, quiz_id, score_percentage, passed, submitted_at").eq("user_id", userId).order("submitted_at", { ascending: false }),
    supabase.from("certificates").select("id, course_id, issued_at, certificate_number").eq("user_id", userId),
    supabase.from("courses").select("id, title"),
    supabase.from("lessons").select("id, module_id, title, sort_order, is_required").order("sort_order"),
    supabase.from("modules").select("id, course_id, title, sort_order").order("sort_order"),
    supabase.from("quizzes").select("id, title, module_id, course_id"),
  ]);

  const courseMap = new Map((courses ?? []).map((c) => [c.id, c.title]));
  const completedLessons = new Map((progress ?? []).map((p) => [p.lesson_id, p.completed_at as string]));
  const certByCourse = new Map((certificates ?? []).map((c) => [c.course_id, c]));
  const quizMap = new Map((allQuizzes ?? []).map((q) => [q.id, q]));

  const typedAttempts = (attempts ?? []) as Array<{
    id: string; quiz_id: string; score_percentage: number; passed: boolean; submitted_at: string;
  }>;

  const courseDetails = (enrollments ?? []).map((enrollment) => {
    const courseModules = (allModules ?? [])
      .filter((m) => m.course_id === enrollment.course_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const requiredLessons = (allLessons ?? []).filter((l) => {
      const mod = (allModules ?? []).find((m) => m.id === l.module_id);
      return mod?.course_id === enrollment.course_id && l.is_required;
    });
    const completedCount = requiredLessons.filter((l) => completedLessons.has(l.id)).length;

    // Quiz attempts for this course, grouped by quiz
    const courseAttempts = typedAttempts.filter((a) => quizMap.get(a.quiz_id)?.course_id === enrollment.course_id);
    const attemptsByQuiz = new Map<string, typeof courseAttempts>();
    for (const a of courseAttempts) {
      if (!attemptsByQuiz.has(a.quiz_id)) attemptsByQuiz.set(a.quiz_id, []);
      attemptsByQuiz.get(a.quiz_id)!.push(a);
    }

    const moduleProgress = courseModules.map((mod) => {
      const moduleQuiz = (allQuizzes ?? []).find((q) => q.module_id === mod.id);
      const quizAttempts = moduleQuiz ? (attemptsByQuiz.get(moduleQuiz.id) ?? []) : [];
      const latestAttempt = quizAttempts[0] ?? null; // already sorted desc
      return {
        module: mod,
        quiz: moduleQuiz ? { id: moduleQuiz.id, title: moduleQuiz.title, latestAttempt, attemptCount: quizAttempts.length } : null,
        lessons: (allLessons ?? [])
          .filter((l) => l.module_id === mod.id)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((l) => ({ ...l, completed_at: completedLessons.get(l.id) ?? null })),
      };
    });

    return {
      enrollment,
      course_title: courseMap.get(enrollment.course_id) ?? "Unknown course",
      lessons_completed: completedCount,
      lessons_total: requiredLessons.length,
      progress_percentage: requiredLessons.length ? Math.round((completedCount / requiredLessons.length) * 100) : 0,
      moduleProgress,
      certificate: certByCourse.get(enrollment.course_id) ?? null,
    };
  });

  // Enrich quiz attempts with quiz title and per-question answer breakdown
  const attemptIds = typedAttempts.map((a) => a.id);
  const allAnswers = attemptIds.length
    ? await (async () => {
        const { data: ans } = await supabase
          .from("attempt_answers")
          .select("attempt_id, question_id, selected_choice_id, is_correct, questions(prompt, explanation, correct_choice_id, sort_order)")
          .in("attempt_id", attemptIds);
        if (!ans || ans.length === 0) return new Map<string, AttemptAnswerDetail[]>();

        const questionIds = [...new Set(ans.map((a) => a.question_id))];
        const { data: choices } = questionIds.length
          ? await supabase.from("question_choices").select("id, question_id, choice_text").in("question_id", questionIds)
          : { data: [] };
        const choiceMap = new Map((choices ?? []).map((c) => [c.id, c.choice_text as string]));

        const byAttempt = new Map<string, AttemptAnswerDetail[]>();
        for (const a of ans) {
          const attemptId = a.attempt_id as string;
          const q = a.questions as unknown as { prompt: string; explanation: string | null; correct_choice_id: string | null; sort_order: number } | null;
          const detail: AttemptAnswerDetail = {
            question_id: a.question_id,
            prompt: q?.prompt ?? "",
            sort_order: q?.sort_order ?? 0,
            is_correct: a.is_correct as boolean,
            selected_choice_text: a.selected_choice_id ? (choiceMap.get(a.selected_choice_id as string) ?? null) : null,
            correct_choice_text: q?.correct_choice_id ? (choiceMap.get(q.correct_choice_id) ?? null) : null,
            explanation: q?.explanation ?? null,
          };
          if (!byAttempt.has(attemptId)) byAttempt.set(attemptId, []);
          byAttempt.get(attemptId)!.push(detail);
        }
        // Sort each attempt's answers by sort_order
        for (const [, details] of byAttempt) details.sort((a, b) => a.sort_order - b.sort_order);
        return byAttempt;
      })()
    : new Map<string, AttemptAnswerDetail[]>();

  const enrichedAttempts = typedAttempts.map((a) => ({
    ...a,
    quiz_title: quizMap.get(a.quiz_id)?.title ?? "Assessment",
    answers: allAnswers.get(a.id) ?? [],
  }));

  return {
    profile: profile as { id: string; full_name: string | null; role: string } | null,
    courseDetails,
    quizAttempts: enrichedAttempts,
  };
}

export type AttemptAnswerDetail = {
  question_id: string;
  prompt: string;
  sort_order: number;
  is_correct: boolean;
  selected_choice_text: string | null;
  correct_choice_text: string | null;
  explanation: string | null;
};

export async function getAttemptAnswers(attemptId: string): Promise<AttemptAnswerDetail[]> {
  const supabase = await createSupabaseServerClient();

  const { data: answers } = await supabase
    .from("attempt_answers")
    .select("question_id, selected_choice_id, is_correct, questions(prompt, explanation, correct_choice_id, sort_order)")
    .eq("attempt_id", attemptId);

  if (!answers || answers.length === 0) return [];

  const questionIds = answers.map((a) => a.question_id);
  const { data: choices } = await supabase
    .from("question_choices")
    .select("id, question_id, choice_text")
    .in("question_id", questionIds);

  const choiceMap = new Map((choices ?? []).map((c) => [c.id, c.choice_text as string]));

  return answers
    .map((a) => {
      const q = a.questions as unknown as { prompt: string; explanation: string | null; correct_choice_id: string | null; sort_order: number } | null;
      return {
        question_id: a.question_id,
        prompt: q?.prompt ?? "",
        sort_order: q?.sort_order ?? 0,
        is_correct: a.is_correct as boolean,
        selected_choice_text: a.selected_choice_id ? (choiceMap.get(a.selected_choice_id as string) ?? null) : null,
        correct_choice_text: q?.correct_choice_id ? (choiceMap.get(q.correct_choice_id) ?? null) : null,
        explanation: q?.explanation ?? null,
      };
    })
    .sort((a, b) => a.sort_order - b.sort_order);
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
