"use client";

import { useActionState } from "react";
import { createQuiz, type CourseActionState } from "@/app/actions/admin";

export default function QuizCreateForm({ courseId }: { courseId: string }) {
  const [state, action, pending] = useActionState(createQuiz, {} as CourseActionState);

  return (
    <form action={action} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
      <input type="hidden" name="courseId" value={courseId} />
      <input
        name="title"
        required
        placeholder="Quiz title e.g. Module 1 Assessment"
        className="rounded-xl border border-[#d5e9ed] px-4 py-3 text-sm text-[#002f65] outline-none focus:border-[#007c8b]"
      />
      <div className="flex items-center gap-2">
        <input
          name="pass_percentage"
          type="number"
          min={1}
          max={100}
          defaultValue={80}
          className="w-20 rounded-xl border border-[#d5e9ed] px-3 py-3 text-center text-sm outline-none focus:border-[#007c8b]"
        />
        <span className="text-sm text-[#526b78]">% to pass</span>
      </div>
      <button
        disabled={pending}
        className="rounded-xl bg-[#007c8b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006b78] disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create quiz"}
      </button>
      {state.error && <p className="text-sm text-red-700 md:col-span-3">{state.error}</p>}
      {state.success && <p className="text-sm font-medium text-green-700 md:col-span-3">✓ Quiz created.</p>}
    </form>
  );
}
