"use client";

import { useActionState, useState } from "react";
import { createChoice, type QuizItemState } from "@/app/actions/admin";

export default function ChoiceForm({
  courseId,
  quizId,
  questionId,
}: {
  courseId: string;
  quizId: string;
  questionId: string;
}) {
  const [state, action, pending] = useActionState(createChoice, {} as QuizItemState);
  const [isCorrect, setIsCorrect] = useState(false);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="questionId" value={questionId} />
      <input type="hidden" name="is_correct" value={String(isCorrect)} />

      <input
        name="choice_text"
        required
        placeholder="Add answer choice…"
        className="min-w-0 flex-1 rounded-xl border border-[#d5e9ed] px-3 py-2 text-sm outline-none focus:border-[#007c8b]"
      />

      <label className="flex cursor-pointer items-center gap-2 text-xs text-[#526b78]">
        <input
          type="checkbox"
          checked={isCorrect}
          onChange={(e) => setIsCorrect(e.target.checked)}
          className="h-4 w-4 accent-[#007c8b]"
        />
        Correct answer
      </label>

      <button
        disabled={pending}
        className="rounded-xl bg-[#edf7f8] px-4 py-2 text-xs font-semibold text-[#007c8b] transition hover:bg-[#d9f2f4] disabled:opacity-60"
      >
        {pending ? "Adding…" : "+ Add"}
      </button>

      {state.error && <p className="w-full text-xs text-red-700">{state.error}</p>}
      {state.success && <p className="w-full text-xs font-medium text-green-700">✓ Choice added.</p>}
    </form>
  );
}
