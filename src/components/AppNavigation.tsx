"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const links = [
  { href: "/dashboard", label: "My learning", description: "Continue your assigned courses" },
  { href: "/courses", label: "Course catalogue", description: "Browse available training" },
  { href: "/certificates", label: "Certificates", description: "View completed training" },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function useUser() {
  const [name, setName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        // Try profile full_name first, fall back to email
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            setName(profile?.full_name || user.email?.split("@")[0] || "Learner");
            setLoaded(true);
          });
      } else {
        setLoaded(true);
      }
    });
  }, []);

  return { name, loaded };
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const adminArea = pathname.startsWith("/admin");
  const { name, loaded } = useUser();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#d9e9ec] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3" aria-label="Ekagra Medical Team Training home" onClick={() => setOpen(false)}>
            <Image src="/ekagra-logo.png" alt="Ekagra Hospital" width={154} height={65} className="h-11 w-auto object-contain" priority />
            <span className="hidden border-l border-[#d9e9ec] pl-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#527084] md:block">Team training</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive(pathname, link.href) ? "bg-[#edf7f8] text-[#123d69]" : "text-[#527084] hover:bg-[#f4fafb] hover:text-[#123d69]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {adminArea ? (
              <Link href="/admin" className="ml-2 rounded-lg bg-[#123d69] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2b4f]">
                Admin workspace
              </Link>
            ) : (
              <Link href="/admin" className="ml-2 rounded-lg border border-[#d9e9ec] px-4 py-2.5 text-sm font-medium text-[#527084] transition hover:border-[#86bdc6] hover:text-[#123d69]">
                Staff area
              </Link>
            )}

            {/* User avatar / menu */}
            {loaded && name && (
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full bg-[#002f65] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#001f43]"
                  aria-label="Account menu"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                    {initials(name)}
                  </span>
                  <span className="max-w-[120px] truncate">{name}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-white py-2 shadow-lg ring-1 ring-[#d5e9ed]">
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut(); }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#9d2c25] hover:bg-[#fff8f7]"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-lg border border-[#d9e9ec] p-2.5 text-[#123d69] lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1.5 block h-0.5 w-5 bg-current" />
            <span className="mt-1.5 block h-0.5 w-5 bg-current" />
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav id="mobile-navigation" className="border-t border-[#d9e9ec] bg-white px-5 py-4 lg:hidden" aria-label="Mobile navigation">
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-3 ${isActive(pathname, link.href) ? "bg-[#edf7f8] text-[#123d69]" : "text-[#527084] hover:bg-[#f4fafb]"}`}
                >
                  <span className="block text-sm font-semibold">{link.label}</span>
                  <span className="mt-0.5 block text-xs text-[#78909d]">{link.description}</span>
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-[#527084] hover:bg-[#f4fafb]"
              >
                <span className="block text-sm font-semibold">Staff area</span>
                <span className="mt-0.5 block text-xs text-[#78909d]">Admin and instructor tools</span>
              </Link>
            </div>

            <div className="mt-3 border-t border-[#edf2f3] pt-3 space-y-2">
              {loaded && name ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl bg-[#f6feff] px-4 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#002f65] text-sm font-bold text-white">
                      {initials(name)}
                    </span>
                    <span className="text-sm font-semibold text-[#002f65]">{name}</span>
                  </div>
                  <button
                    onClick={() => { setOpen(false); signOut(); }}
                    className="w-full rounded-xl border border-[#f5c6c0] px-4 py-3 text-center text-sm font-semibold text-[#9d2c25] hover:bg-[#fff8f7]"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl bg-[#123d69] px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Public preview
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Close user menu on outside click */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} aria-hidden />
      )}
    </>
  );
}
