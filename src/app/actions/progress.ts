"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markLessonComplete(formData: FormData) {
  const lessonId = String(formData.get("lessonId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "");
  if (!lessonId || !courseId || !moduleId) return;

  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return;

  // Verify an active enrollment exists before writing progress
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("status", "active")
    .maybeSingle();
  if (!enrollment) return;

  await supabase.from("lesson_progress").upsert({
    user_id: userId,
    lesson_id: lessonId,
    completed_at: new Date().toISOString(),
    last_viewed_at: new Date().toISOString(),
  }, { onConflict: "user_id,lesson_id" });

  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/modules/${moduleId}`);
  revalidatePath(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
  revalidatePath("/dashboard");

  // Only redirect to the module quiz once all required lessons are finished
  const { data: quiz } = await supabase.from("quizzes").select("id").eq("module_id", moduleId).maybeSingle();
  if (quiz) {
    const [{ data: required }, { data: done }] = await Promise.all([
      supabase.from("lessons").select("id").eq("module_id", moduleId).eq("is_required", true),
      supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId).not("completed_at", "is", null),
    ]);
    const requiredIds = new Set((required ?? []).map((l) => l.id));
    const doneIds = new Set((done ?? []).map((p) => p.lesson_id));
    const allDone = [...requiredIds].every((id) => doneIds.has(id));
    if (allDone) redirect(`/quiz/${quiz.id}`);
  }
  redirect(`/courses/${courseId}/modules/${moduleId}`);
}
