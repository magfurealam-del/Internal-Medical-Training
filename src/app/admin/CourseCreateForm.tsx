"use client";

import { useActionState } from "react";
import { createCourse, type CourseActionState } from "@/app/actions/admin";

export default function CourseCreateForm() {
  const [state, action, pending] = useActionState(createCourse, {} as CourseActionState);
  return <form action={action} className="mt-6 space-y-4"><div><label className="text-sm text-white/75" htmlFor="title">Course title</label><input className="mt-1 w-full rounded-xl border-0 px-4 py-3 text-[#002f65]" id="title" name="title" required /></div><div><label className="text-sm text-white/75" htmlFor="slug">Slug</label><input className="mt-1 w-full rounded-xl border-0 px-4 py-3 text-[#002f65]" id="slug" name="slug" placeholder="clinical-team-essentials" required /></div><div><label className="text-sm text-white/75" htmlFor="description">Description</label><textarea className="mt-1 min-h-24 w-full rounded-xl border-0 px-4 py-3 text-[#002f65]" id="description" name="description" /></div><button disabled={pending} className="w-full rounded-xl bg-[#7bdcb5] px-4 py-3 font-semibold text-[#002f65] disabled:opacity-60">{pending ? "Creating…" : "Create draft course"}</button>{state.error && <p className="text-sm text-[#ffd3d0]" role="alert">{state.error}</p>}{state.success && <p className="text-sm text-[#b9f0c9]" role="status">Draft course created.</p>}</form>;
}
