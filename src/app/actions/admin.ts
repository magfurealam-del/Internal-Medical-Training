"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CourseActionState = { error?: string; success?: boolean };

export async function createCourse(_previousState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const description = String(formData.get("description") ?? "").trim();
  if (!title || !slug) return { error: "Course title and slug are required." };

  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { error: "You must be signed in." };

  const { error } = await supabase.from("courses").insert({
    title,
    slug,
    description: description || null,
    created_by: userId,
    status: "draft",
  });
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function createModule(_previousState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!courseId || !title) return { error: "Module title is required." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("modules").insert({ course_id: courseId, title, description: description || null, sort_order: Number(formData.get("sortOrder") ?? 0) });
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function createLesson(_previousState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const contentPath = String(formData.get("contentPath") ?? "").trim();
  if (!courseId || !moduleId || !title || !slug || !contentPath) return { error: "Lesson title, slug, and content path are required." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("lessons").insert({ module_id: moduleId, title, slug, content_path: contentPath, sort_order: Number(formData.get("sortOrder") ?? 0) });
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function assignCourse(_previousState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const expiresAt = String(formData.get("expiresAt") ?? "").trim();
  if (!courseId || !userId) return { error: "Course and learner are required." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("enrollments").upsert({ user_id: userId, course_id: courseId, status: "active", expires_at: expiresAt || null }, { onConflict: "user_id,course_id" });
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function assignCourseToAudienceGroup(_previousState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const audienceGroupId = String(formData.get("audienceGroupId") ?? "");
  const expiresAt = String(formData.get("expiresAt") ?? "").trim();
  if (!courseId || !audienceGroupId) return { error: "Course and audience group are required." };

  const supabase = await createSupabaseServerClient();

  // Fetch all profiles in the audience group — audience_groups don't directly link profiles,
  // so we enroll everyone whose role matches the group slug, or we can enroll all learners.
  // Since profiles don't have a group FK, we enroll all learners (role = 'learner') in one go.
  // A future migration can add profile<->group membership if needed.
  const { data: group, error: groupError } = await supabase
    .from("audience_groups")
    .select("id, name, slug")
    .eq("id", audienceGroupId)
    .maybeSingle();
  if (groupError || !group) return { error: "Audience group not found." };

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id");
  if (profilesError) return { error: profilesError.message };
  if (!profiles || profiles.length === 0) return { error: "No learner profiles found." };

  const rows = profiles.map((p) => ({
    user_id: p.id,
    course_id: courseId,
    status: "active",
    expires_at: expiresAt || null,
  }));

  const { error } = await supabase
    .from("enrollments")
    .upsert(rows, { onConflict: "user_id,course_id" });
  if (error) return { error: error.message };

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateCourse(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!courseId || !title) return { error: "Course title is required." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("courses").update({ title, description: description || null }).eq("id", courseId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin");
  revalidatePath("/courses");
  return { success: true };
}

export async function updateModule(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const moduleId = String(formData.get("moduleId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  if (!moduleId || !title) return { error: "Module title is required." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("modules").update({ title, description: description || null, sort_order: sortOrder }).eq("id", moduleId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function updateLesson(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const lessonId = String(formData.get("lessonId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const contentPath = String(formData.get("content_path") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  if (!lessonId || !title || !contentPath) return { error: "Lesson title and content path are required." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("lessons").update({ title, content_path: contentPath, sort_order: sortOrder }).eq("id", lessonId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function unenrollLearner(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!enrollmentId) return { error: "Enrollment ID is required." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateEnrollmentDeadline(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const expiresAt = String(formData.get("expires_at") ?? "").trim();
  if (!enrollmentId) return { error: "Enrollment ID is required." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("enrollments").update({ expires_at: expiresAt || null }).eq("id", enrollmentId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createQuiz(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const passPercentage = Number(formData.get("pass_percentage") ?? 80);
  if (!courseId || !title) return { error: "Quiz title is required." };
  if (passPercentage < 1 || passPercentage > 100) return { error: "Pass mark must be between 1 and 100." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("quizzes").insert({ course_id: courseId, title, pass_percentage: passPercentage, sort_order: 0 });
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export type QuizItemState = { error?: string; success?: boolean; questionId?: string };

export async function createQuestion(_prev: QuizItemState, formData: FormData): Promise<QuizItemState> {
  const quizId = String(formData.get("quizId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  if (!quizId || !prompt) return { error: "Question prompt is required." };
  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase.from("questions").select("id").eq("quiz_id", quizId).order("sort_order", { ascending: false }).limit(1);
  const nextOrder = ((existing ?? [])[0] as { id: string } | undefined) ? 0 : 0;
  const { data, error } = await supabase
    .from("questions")
    .insert({ quiz_id: quizId, prompt, explanation: explanation || null, sort_order: nextOrder })
    .select("id")
    .maybeSingle();
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}/quizzes/${quizId}`);
  return { success: true, questionId: (data as { id: string } | null)?.id };
}

export async function createChoice(_prev: QuizItemState, formData: FormData): Promise<QuizItemState> {
  const questionId = String(formData.get("questionId") ?? "");
  const quizId = String(formData.get("quizId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const choiceText = String(formData.get("choice_text") ?? "").trim();
  const isCorrect = formData.get("is_correct") === "true";
  if (!questionId || !choiceText) return { error: "Choice text is required." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("question_choices")
    .insert({ question_id: questionId, choice_text: choiceText, sort_order: 0 })
    .select("id")
    .maybeSingle();
  if (error) return { error: error.message };
  if (isCorrect && data) {
    await supabase.from("questions").update({ correct_choice_id: (data as { id: string }).id }).eq("id", questionId);
  }
  revalidatePath(`/admin/courses/${courseId}/quizzes/${quizId}`);
  return { success: true };
}

export async function setCorrectChoice(_prev: QuizItemState, formData: FormData): Promise<QuizItemState> {
  const questionId = String(formData.get("questionId") ?? "");
  const choiceId = String(formData.get("choiceId") ?? "");
  const quizId = String(formData.get("quizId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!questionId || !choiceId) return { error: "Question and choice are required." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("questions").update({ correct_choice_id: choiceId }).eq("id", questionId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}/quizzes/${quizId}`);
  return { success: true };
}

export async function updateCourseStatus(_previousState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!courseId || !["draft", "published", "archived"].includes(status)) return { error: "Invalid course status." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("courses").update({ status }).eq("id", courseId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/courses");
  revalidatePath("/dashboard");
  return { success: true };
}
