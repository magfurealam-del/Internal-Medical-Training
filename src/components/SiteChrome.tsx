import Image from "next/image";
import Link from "next/link";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f5fbfc] text-[#12324b]">
    <header className="border-b border-[#d9e9ec] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="Ekagra Medical Team Training home">
          <Image src="/ekagra-logo.png" alt="Ekagra Hospital" width={154} height={65} className="h-12 w-auto object-contain" priority />
          <span className="hidden border-l border-[#d9e9ec] pl-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#527084] sm:block">Team training</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium text-[#527084]" aria-label="Primary navigation">
          <Link href="/dashboard" className="rounded-full px-4 py-2 transition hover:bg-[#edf7f8] hover:text-[#123d69]">Dashboard</Link>
          <Link href="/courses" className="rounded-full px-4 py-2 transition hover:bg-[#edf7f8] hover:text-[#123d69]">Courses</Link>
          <Link href="/login" className="rounded-full bg-[#123d69] px-5 py-2.5 text-white shadow-sm transition hover:bg-[#0b2b4f]">Sign in</Link>
        </nav>
      </div>
    </header>
    {children}
    <footer className="border-t border-[#d9e9ec] bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-7 text-xs text-[#668091] sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>Ekagra Advanced Wound and Foot Care Hospital</span><span>Internal medical team training platform</span></div></footer>
  </div>;
}
