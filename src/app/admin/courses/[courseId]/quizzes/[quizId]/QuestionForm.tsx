"use client";

import { useActionState } from "react";
import { createQuestion, type QuizItemState } from "@/app/actions/admin";

export default function QuestionForm({ courseId, quizId }: { courseId: string; quizId: string }) {
  const [state, action, pending] = useActionState(createQuestion, {} as QuizItemState);

  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="quizId" value={quizId} />
      <div>
        <label className="block text-sm font-medium text-[#002f65]">Question prompt</label>
        <textarea
          name="prompt"
          required
          rows={3}
          placeholder="e.g. What is the first step when assessing a wound?"
          className="mt-1 w-full rounded-xl border border-[#d5e9ed] px-4 py-3 text-sm text-[#002f65] outline-none focus:border-[#007c8b]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#002f65]">
          Explanation <span className="font-normal text-[#526b78]">(shown after submission)</span>
        </label>
        <textarea
          name="explanation"
          rows={2}
          placeholder="Optional — explain why the correct answer is correct"
          className="mt-1 w-full rounded-xl border border-[#d5e9ed] px-4 py-3 text-sm text-[#002f65] outline-none focus:border-[#007c8b]"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          disabled={pending}
          className="rounded-xl bg-[#002f65] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001f43] disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add question"}
        </button>
        {state.error && <p className="text-sm text-red-700">{state.error}</p>}
        {state.success && <p className="text-sm font-medium text-green-700">✓ Question added.</p>}
      </div>
    </form>
  );
}
