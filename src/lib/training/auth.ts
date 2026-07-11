import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireTrainingStaff() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const role = data?.claims?.app_metadata?.role;
  if (role !== "administrator" && role !== "instructor") redirect("/dashboard");
  return data!.claims;
}
