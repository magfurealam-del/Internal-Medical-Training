"use client";

export default function AdminCourseError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Course unavailable</p><h1 className="mt-4 text-4xl font-semibold text-[#002f65]">We could not load this course.</h1><p className="mt-4 text-[#526b78]">Try again, or return to the staff workspace if the problem continues.</p><button type="button" onClick={reset} className="mt-8 rounded-xl bg-[#002f65] px-5 py-3 text-sm font-semibold text-white">Try again</button></main>;
}
