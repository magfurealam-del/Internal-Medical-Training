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

  const { data: quiz } = await supabase.from("quizzes").select("id").eq("module_id", moduleId).maybeSingle();
  if (quiz) redirect(`/quiz/${quiz.id}`);
  redirect(`/courses/${courseId}/modules/${moduleId}`);
}
