import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  // Course catalogue and lesson pages are public during the preview period.
  // Learner/admin data remains protected by the session refresh and server-side checks.
  matcher: ["/", "/dashboard/:path*", "/quiz/:path*", "/certificates/:path*", "/admin/:path*", "/profile/:path*", "/settings/:path*"],
};
