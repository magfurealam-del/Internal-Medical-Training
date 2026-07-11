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
