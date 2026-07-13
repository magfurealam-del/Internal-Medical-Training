"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEnrollmentEmail } from "@/lib/training/email";

async function assertAdmin(): Promise<{ supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>; userId: string } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { error: "You must be signed in." };
  const role = claims.app_metadata?.role as string | undefined;
  if (role !== "administrator" && role !== "instructor") return { error: "You do not have permission to perform this action." };
  return { supabase, userId: claims.sub };
}

export type CourseActionState = { error?: string; success?: boolean };

export async function createCourse(_previousState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const description = String(formData.get("description") ?? "").trim();
  if (!title || !slug) return { error: "Course title and slug are required." };

  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase, userId } = auth;

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
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { count } = await supabase.from("modules").select("*", { count: "exact", head: true }).eq("course_id", courseId);
  const { error } = await supabase.from("modules").insert({ course_id: courseId, title, description: description || null, sort_order: (count ?? 0) });
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
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { count } = await supabase.from("lessons").select("*", { count: "exact", head: true }).eq("module_id", moduleId);
  const { error } = await supabase.from("lessons").insert({ module_id: moduleId, title, slug, content_path: contentPath, sort_order: (count ?? 0) });
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function assignCourse(_previousState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const expiresAt = String(formData.get("expiresAt") ?? "").trim();
  if (!courseId || !userId) return { error: "Course and learner are required." };
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { error } = await supabase.from("enrollments").upsert({ user_id: userId, course_id: courseId, status: "active", expires_at: expiresAt || null }, { onConflict: "user_id,course_id" });
  if (error) return { error: error.message };

  // Send enrollment confirmation — best-effort, don't block on failure
  try {
    const [{ data: profile }, { data: course }, { data: userRecord }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
      supabase.from("courses").select("title").eq("id", courseId).maybeSingle(),
      getSupabaseAdminClient().auth.admin.getUserById(userId),
    ]);
    const email = userRecord?.user?.email;
    if (email && course) {
      await sendEnrollmentEmail({
        to: email,
        learnerName: profile?.full_name ?? "there",
        courseTitle: course.title,
        courseId,
        expiresAt: expiresAt || null,
      });
    }
  } catch {
    // Email failure must not block enrollment
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function assignCourseToAudienceGroup(_previousState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const audienceGroupId = String(formData.get("audienceGroupId") ?? "");
  const expiresAt = String(formData.get("expiresAt") ?? "").trim();
  if (!courseId || !audienceGroupId) return { error: "Course and audience group are required." };

  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;

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
    .select("id")
    .eq("role", "learner");
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

  // Send enrollment emails to all enrolled learners — best-effort
  try {
    const { data: course } = await supabase.from("courses").select("title").eq("id", courseId).maybeSingle();
    if (course) {
      await Promise.allSettled(
        profiles.map(async (p) => {
          const [{ data: profile }, { data: userRecord }] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("id", p.id).maybeSingle(),
            getSupabaseAdminClient().auth.admin.getUserById(p.id),
          ]);
          const email = userRecord?.user?.email;
          if (email) {
            await sendEnrollmentEmail({
              to: email,
              learnerName: profile?.full_name ?? "there",
              courseTitle: course.title,
              courseId,
              expiresAt: expiresAt || null,
            });
          }
        })
      );
    }
  } catch {
    // Email failure must not block enrollment
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

// ── Delete actions ──────────────────────────────────────────────────────────

export async function deleteModule(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const moduleId = String(formData.get("moduleId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!moduleId) return { error: "Module ID is required." };
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { error } = await supabase.from("modules").delete().eq("id", moduleId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function deleteLesson(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const lessonId = String(formData.get("lessonId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!lessonId) return { error: "Lesson ID is required." };
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function deleteQuestion(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const questionId = String(formData.get("questionId") ?? "");
  const quizId = String(formData.get("quizId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!questionId) return { error: "Question ID is required." };
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { error } = await supabase.from("questions").delete().eq("id", questionId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}/quizzes/${quizId}`);
  return { success: true };
}

export async function deleteChoice(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const choiceId = String(formData.get("choiceId") ?? "");
  const questionId = String(formData.get("questionId") ?? "");
  const quizId = String(formData.get("quizId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!choiceId) return { error: "Choice ID is required." };
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  // If this was the correct choice, clear that reference first
  await supabase.from("questions").update({ correct_choice_id: null }).eq("id", questionId).eq("correct_choice_id", choiceId);
  const { error } = await supabase.from("question_choices").delete().eq("id", choiceId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}/quizzes/${quizId}`);
  return { success: true };
}

// ── Reorder actions ──────────────────────────────────────────────────────────

export async function reorderModule(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const moduleId = String(formData.get("moduleId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const direction = String(formData.get("direction") ?? "") as "up" | "down";
  if (!moduleId || !courseId) return { error: "Missing IDs." };
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { data: modules } = await supabase.from("modules").select("id, sort_order").eq("course_id", courseId).order("sort_order");
  if (!modules) return { error: "Could not load modules." };
  const idx = modules.findIndex((m) => m.id === moduleId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= modules.length) return { success: true };
  const a = modules[idx], b = modules[swapIdx];
  // Sequential updates avoid a race where both rows briefly hold the same sort_order
  await supabase.from("modules").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("modules").update({ sort_order: a.sort_order }).eq("id", b.id);
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function reorderLesson(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const lessonId = String(formData.get("lessonId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const direction = String(formData.get("direction") ?? "") as "up" | "down";
  if (!lessonId || !moduleId) return { error: "Missing IDs." };
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { data: lessons } = await supabase.from("lessons").select("id, sort_order").eq("module_id", moduleId).order("sort_order");
  if (!lessons) return { error: "Could not load lessons." };
  const idx = lessons.findIndex((l) => l.id === lessonId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= lessons.length) return { success: true };
  const a = lessons[idx], b = lessons[swapIdx];
  await supabase.from("lessons").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("lessons").update({ sort_order: a.sort_order }).eq("id", b.id);
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function updateCourse(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!courseId || !title) return { error: "Course title is required." };
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
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
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
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
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { error } = await supabase.from("lessons").update({ title, content_path: contentPath, sort_order: sortOrder }).eq("id", lessonId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function unenrollLearner(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!enrollmentId) return { error: "Enrollment ID is required." };
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
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
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
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
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { count } = await supabase.from("quizzes").select("*", { count: "exact", head: true }).eq("course_id", courseId);
  const { error } = await supabase.from("quizzes").insert({ course_id: courseId, title, pass_percentage: passPercentage, sort_order: (count ?? 0) });
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
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { count } = await supabase.from("questions").select("*", { count: "exact", head: true }).eq("quiz_id", quizId);
  const { data, error } = await supabase
    .from("questions")
    .insert({ quiz_id: quizId, prompt, explanation: explanation || null, sort_order: (count ?? 0) })
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
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { count: choiceCount } = await supabase
    .from("question_choices")
    .select("*", { count: "exact", head: true })
    .eq("question_id", questionId);
  const { data, error } = await supabase
    .from("question_choices")
    .insert({ question_id: questionId, choice_text: choiceText, sort_order: choiceCount ?? 0 })
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
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { error } = await supabase.from("questions").update({ correct_choice_id: choiceId }).eq("id", questionId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}/quizzes/${quizId}`);
  return { success: true };
}

export async function updateCourseStatus(_previousState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!courseId || !["draft", "published", "archived"].includes(status)) return { error: "Invalid course status." };
  const auth = await assertAdmin();
  if ("error" in auth) return auth;
  const { supabase } = auth;
  const { error } = await supabase.from("courses").update({ status }).eq("id", courseId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/courses");
  revalidatePath("/dashboard");
  return { success: true };
}
