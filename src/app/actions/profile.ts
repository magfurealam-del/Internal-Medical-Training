"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; success?: boolean };

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { error: "Name cannot be empty." };
  if (fullName.length > 100) return { error: "Name must be 100 characters or fewer." };

  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
