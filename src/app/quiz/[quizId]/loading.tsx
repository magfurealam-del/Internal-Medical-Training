export default function QuizLoading() {
  return (
    <main className="mx-auto max-w-4xl animate-pulse px-6 py-12 lg:px-10">
      <div className="h-4 w-48 rounded bg-[#d9f2f4]" />
      <div className="mt-8 h-4 w-24 rounded bg-[#d9f2f4]" />
      <div className="mt-3 h-12 w-2/3 rounded-xl bg-[#e5eef5]" />
      <div className="mt-5 flex gap-3">
        <div className="h-7 w-28 rounded-full bg-[#edf7f8]" />
        <div className="h-7 w-24 rounded-full bg-[#edf7f8]" />
      </div>
      <div className="mt-8 space-y-5">
        {[1, 2, 3].map((q) => (
          <div key={q} className="rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed] space-y-3">
            <div className="h-5 w-3/4 rounded bg-[#e5eef5]" />
            <div className="space-y-2 pt-2">
              {[1, 2, 3, 4].map((c) => (
                <div key={c} className="h-12 rounded-xl border border-[#d5e9ed] bg-[#f6feff]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
