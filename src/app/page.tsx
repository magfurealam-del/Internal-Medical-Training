import Link from "next/link";

const foundations = [
  ["01", "Secure access", "Role-aware sign-in for learners, instructors, and administrators."],
  ["02", "Structured learning", "Courses, modules, lessons, assessments, and completion in one place."],
  ["03", "Clear progress", "A dependable view of what is assigned, started, and complete."],
];

export default function Home() {
  return (
    <main className="flex-1 bg-[#f6feff] text-[#002f65]">
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-24">
        <div>
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#007c8b]">Learning that supports better care</p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Build confidence. Strengthen teams. Improve practice.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#52645e]">
            A focused training space for medical teams, instructors, and trusted external partners. The platform foundation is ready for your first course.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a className="rounded-full bg-[#002f65] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#001f43]" href="/dashboard">Open dashboard</a>
            <Link className="rounded-full border border-[#b8dce1] bg-white px-6 py-3.5 text-sm font-semibold transition hover:border-[#007c8b]" href="/courses">Explore courses</Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-[#d9f2f4] p-8 shadow-sm lg:p-10">
          <div className="absolute -right-14 -top-14 size-48 rounded-full bg-[#9dd7de]" />
          <div className="relative rounded-2xl bg-[#002f65] p-6 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-white/15 pb-5">
              <span className="text-sm text-white/65">Your learning space</span>
              <span className="rounded-full bg-[#9ed9b9]/15 px-3 py-1 text-xs text-[#b9f0c9]">MVP foundation</span>
            </div>
            <div className="py-8">
              <p className="text-sm text-white/55">Pilot course</p>
              <h2 className="mt-2 text-2xl font-semibold">Clinical team essentials</h2>
              <div className="mt-7 h-2 rounded-full bg-white/10"><div className="h-2 w-[38%] rounded-full bg-[#7bdcb5]" /></div>
              <div className="mt-3 flex justify-between text-xs text-white/55"><span>Progress</span><span>38%</span></div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-white/15 pt-5 text-center text-xs text-white/60"><span>Modules<br /><strong className="text-white">05</strong></span><span>Lessons<br /><strong className="text-white">18</strong></span><span>Assessments<br /><strong className="text-white">03</strong></span></div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#d5e9ed] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:grid-cols-3 lg:px-10">
          {foundations.map(([number, title, description]) => <div key={number} className="border-l-2 border-[#9dd7de] pl-5"><span className="font-mono text-xs text-[#007c8b]">{number}</span><h3 className="mt-3 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#526b78]">{description}</p></div>)}
        </div>
      </section>
    </main>
  );
}
