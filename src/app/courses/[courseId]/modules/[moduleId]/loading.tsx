export default function ModuleLoading() {
  return (
    <main className="mx-auto max-w-5xl animate-pulse px-6 py-16 lg:px-10">
      <div className="h-4 w-32 rounded bg-[#d9f2f4]" />
      <div className="mt-10 h-4 w-20 rounded bg-[#d9f2f4]" />
      <div className="mt-3 h-12 w-3/4 rounded-xl bg-[#e5eef5]" />
      <div className="mt-6 h-2 rounded-full bg-[#d9f2f4]" />
      <div className="mt-10 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
            <div className="h-8 w-8 rounded-lg bg-[#edf7f8]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded bg-[#e5eef5]" />
              <div className="h-3 w-1/4 rounded bg-[#d9f2f4]" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
