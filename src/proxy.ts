import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*", "/quiz/:path*", "/certificates/:path*", "/admin/:path*", "/profile/:path*", "/settings/:path*"],
};
