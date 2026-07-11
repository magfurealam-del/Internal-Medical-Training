"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "My learning", description: "Continue your assigned courses" },
  { href: "/courses", label: "Course catalogue", description: "Browse available training" },
  { href: "/certificates", label: "Certificates", description: "View completed training" },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function AppNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const adminArea = pathname.startsWith("/admin");

  return <>
    <header className="sticky top-0 z-40 border-b border-[#d9e9ec] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="Ekagra Medical Team Training home" onClick={() => setOpen(false)}>
          <Image src="/ekagra-logo.png" alt="Ekagra Hospital" width={154} height={65} className="h-11 w-auto object-contain" priority />
          <span className="hidden border-l border-[#d9e9ec] pl-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#527084] md:block">Team training</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.map((link) => <Link key={link.href} href={link.href} className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${isActive(pathname, link.href) ? "bg-[#edf7f8] text-[#123d69]" : "text-[#527084] hover:bg-[#f4fafb] hover:text-[#123d69]"}`}>{link.label}</Link>)}
          {adminArea ? <Link href="/admin" className="ml-2 rounded-lg bg-[#123d69] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2b4f">Admin workspace</Link> : <Link href="/admin" className="ml-2 rounded-lg border border-[#d9e9ec] px-4 py-2.5 text-sm font-medium text-[#527084] transition hover:border-[#86bdc6] hover:text-[#123d69]">Staff area</Link>}
        </nav>
        <button type="button" className="rounded-lg border border-[#d9e9ec] p-2.5 text-[#123d69] lg:hidden" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen((value) => !value)}><span className="block h-0.5 w-5 bg-current" /><span className="mt-1.5 block h-0.5 w-5 bg-current" /><span className="mt-1.5 block h-0.5 w-5 bg-current" /></button>
      </div>
      {open && <nav id="mobile-navigation" className="border-t border-[#d9e9ec] bg-white px-5 py-4 lg:hidden" aria-label="Mobile navigation">
        <div className="space-y-1">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={`block rounded-xl px-4 py-3 ${isActive(pathname, link.href) ? "bg-[#edf7f8] text-[#123d69]" : "text-[#527084] hover:bg-[#f4fafb]"}`}><span className="block text-sm font-semibold">{link.label}</span><span className="mt-0.5 block text-xs text-[#78909d]">{link.description}</span></Link>)}</div>
        <div className="mt-3 border-t border-[#edf2f3] pt-3"><Link href={adminArea ? "/admin" : "/login"} onClick={() => setOpen(false)} className="block rounded-xl bg-[#123d69] px-4 py-3 text-center text-sm font-semibold text-white">{adminArea ? "Open admin workspace" : "Sign in"}</Link></div>
      </nav>}
    </header>
  </>;
}
