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
