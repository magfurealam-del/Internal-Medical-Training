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
