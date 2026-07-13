export default function LessonLoading() {
  return (
    <main className="mx-auto max-w-4xl animate-pulse px-6 py-12 lg:px-10">
      <div className="h-4 w-64 rounded bg-[#d9f2f4]" />
      <div className="mt-8 flex gap-3">
        <div className="h-6 w-28 rounded-full bg-[#edf7f8]" />
      </div>
      <div className="mt-4 h-12 w-3/4 rounded-xl bg-[#e5eef5]" />
      <div className="mt-8 rounded-2xl bg-white p-8 ring-1 ring-[#d5e9ed] lg:p-10 space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className={`h-4 rounded bg-[#edf7f8] ${i % 3 === 0 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
      <div className="mt-8 h-20 rounded-2xl bg-[#f6feff] ring-1 ring-[#d5e9ed]" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="h-16 rounded-2xl bg-white ring-1 ring-[#d5e9ed]" />
        <div className="h-16 rounded-2xl bg-white ring-1 ring-[#d5e9ed]" />
      </div>
    </main>
  );
}
