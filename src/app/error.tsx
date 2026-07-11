"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Something went wrong</p><h1 className="mt-3 text-4xl font-semibold text-[#002f65]">We couldn’t load this page</h1><p className="mt-4 text-[#526b78]">Please try again. If the problem continues, contact your training administrator.</p><button onClick={reset} className="mt-7 rounded-xl bg-[#002f65] px-5 py-3 font-semibold text-white">Try again</button></main>;
}
