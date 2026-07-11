import { AppNavigation } from "@/components/AppNavigation";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f5fbfc] text-[#12324b]">
    <AppNavigation />
    {children}
    <footer className="border-t border-[#d9e9ec] bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-7 text-xs text-[#668091] sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>Ekagra Advanced Wound and Foot Care Hospital</span><span>Internal medical team training platform</span></div></footer>
  </div>;
}
