"use client";
import { useActionState } from "react";
import { createModule, type CourseActionState } from "@/app/actions/admin";

export default function ModuleCreateForm({ courseId }: { courseId: string }) {
  const [state, action, pending] = useActionState(createModule, {} as CourseActionState);
  return (
    <form action={action} className="mt-5 space-y-3">
      <input type="hidden" name="courseId" value={courseId} />
      <input
        className="w-full rounded-xl border border-[#d5e9ed] px-4 py-3 text-sm outline-none focus:border-[#007c8b]"
        name="title"
        placeholder="Module title"
        required
      />
      <textarea
        className="w-full rounded-xl border border-[#d5e9ed] px-4 py-3 text-sm outline-none focus:border-[#007c8b]"
        name="description"
        placeholder="Description (optional)"
        rows={2}
      />
      <button
        disabled={pending}
        className="rounded-xl bg-[#002f65] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add module"}
      </button>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="text-sm text-[#145c36]">Module added.</p>}
    </form>
  );
}
