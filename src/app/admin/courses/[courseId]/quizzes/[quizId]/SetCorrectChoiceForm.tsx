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
  const [, action, pending] = useActionState(setCorrectChoice, {} as QuizItemState);

  return (
    <form action={action}>
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
    </form>
  );
}
