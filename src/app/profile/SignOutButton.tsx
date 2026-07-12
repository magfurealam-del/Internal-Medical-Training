"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleSignOut}
      className="mt-4 rounded-xl border border-[#d5e9ed] px-5 py-2.5 text-sm font-semibold text-[#526b78] transition hover:border-red-300 hover:text-red-700"
    >
      Sign out
    </button>
  );
}
