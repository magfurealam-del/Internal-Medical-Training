"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Course } from "@/lib/training/courses";

type CourseWithProgress = Course & { progress: { percentage: number; completed: number; total: number } };

export default function CourseCatalogue({ courses }: { courses: CourseWithProgress[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const groups = useMemo(() => Array.from(new Map(courses.flatMap((course) => (course.audience_groups ?? []).map((item) => [item.slug, item.name]))).entries()), [courses]);
  const filtered = courses.filter((course) => {
    const matchesQuery = `${course.title} ${course.description ?? ""}`.toLowerCase().includes(query.toLowerCase());
    const matchesGroup = group === "all" || course.audience_groups?.some((item) => item.slug === group);
    return matchesQuery && matchesGroup;
  });

  return <><div className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#d5e9ed] md:flex-row"><label className="flex-1"><span className="sr-only">Search courses</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" className="w-full rounded-xl border border-[#d5e9ed] px-4 py-3 text-sm outline-none focus:border-[#007c8b]" /></label><label><span className="sr-only">Filter by audience</span><select value={group} onChange={(event) => setGroup(event.target.value)} className="w-full rounded-xl border border-[#d5e9ed] bg-white px-4 py-3 text-sm text-[#526b78] outline-none focus:border-[#007c8b] md:min-w-56"><option value="all">All audiences</option>{groups.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}</select></label></div>{filtered.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-[#9dd7de] bg-white p-12 text-center text-sm text-[#526b78]">No courses match your filters.</div> : <div className="mt-6 grid gap-5 md:grid-cols-2">{filtered.map((course) => <Link key={course.id} href={`/courses/${course.id}`} className="rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed] transition hover:-translate-y-0.5 hover:ring-[#007c8b]"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#007c8b]">Assigned to you</p><h2 className="mt-3 text-2xl font-semibold text-[#002f65]">{course.title}</h2></div><span className="rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-medium text-[#007c8b]">{course.progress.percentage}%</span></div><p className="mt-3 text-sm leading-6 text-[#526b78]">{course.description ?? "Training course"}</p><div className="mt-5 flex flex-wrap gap-2">{(course.audience_groups ?? []).map((item) => <span key={item.id} className="rounded-full border border-[#d5e9ed] px-2.5 py-1 text-xs text-[#527084]">{item.name}</span>)}</div><div className="mt-5 h-2 rounded-full bg-[#d9f2f4]"><div className="h-2 rounded-full bg-[#007c8b]" style={{ width: `${course.progress.percentage}%` }} /></div><p className="mt-2 text-xs text-[#526b78]">{course.progress.completed} of {course.progress.total} required lessons complete</p></Link>)}</div>}</>;
}
