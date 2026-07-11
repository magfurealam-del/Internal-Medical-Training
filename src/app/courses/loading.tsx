export default function CoursesLoading() {
  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10" aria-busy="true"><div className="h-4 w-36 animate-pulse rounded bg-[#d9f2f4]" /><div className="mt-4 h-12 w-56 animate-pulse rounded bg-[#d9f2f4]" /><div className="mt-8 h-20 animate-pulse rounded-2xl bg-white ring-1 ring-[#d5e9ed]" /><div className="mt-6 grid gap-5 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-56 animate-pulse rounded-2xl bg-white ring-1 ring-[#d5e9ed]" />)}</div></main>;
}
