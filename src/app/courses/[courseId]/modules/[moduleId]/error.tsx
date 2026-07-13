"use client";

export default function ModuleError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-24 lg:px-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9d2c25]">Error</p>
      <h1 className="mt-3 text-3xl font-semibold text-[#002f65]">Could not load module</h1>
      <p className="mt-3 text-[#526b78]">Something went wrong loading this module. Please try again.</p>
      <button
        onClick={reset}
        className="mt-8 rounded-xl bg-[#002f65] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#001f43]"
      >
        Try again
      </button>
    </main>
  );
}
