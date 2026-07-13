"use client";

import { useActionState } from "react";
import { setCorrectChoice, type QuizItemState } from "@/app/actions/admin";

export default function SetCorrectChoiceForm({
  courseId,
  quizId,
  questionId,
  choiceId,
}: {
  courseId: string;
  quizId: string;
  questionId: string;
  choiceId: string;
}) {
  const [state, action, pending] = useActionState(setCorrectChoice, {} as QuizItemState);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="questionId" value={questionId} />
      <input type="hidden" name="choiceId" value={choiceId} />
      <button
        disabled={pending}
        className="rounded-lg px-3 py-1 text-xs font-semibold text-[#526b78] transition hover:bg-[#edf7f8] hover:text-[#007c8b] disabled:opacity-60"
      >
        {pending ? "Setting…" : "Set correct"}
      </button>
      {state.error && <span className="text-xs text-red-700">{state.error}</span>}
      {state.success && <span className="text-xs font-medium text-green-700">✓</span>}
    </form>
  );
}
