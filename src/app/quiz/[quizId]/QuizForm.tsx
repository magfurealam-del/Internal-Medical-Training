"use client";

import { useActionState } from "react";
import { submitQuiz, type QuizState } from "@/app/actions/quiz";
import type { QuizItem } from "@/lib/training/quizzes";

const initialState: QuizState = {};

export default function QuizForm({ quizId, items }: { quizId: string; items: QuizItem[] }) {
  const [state, formAction, pending] = useActionState(submitQuiz, initialState);
  const questions = Array.from(new Map(items.map((item) => [item.question_id, item])).values());

  return <form action={formAction} className="mt-8 space-y-5"><input type="hidden" name="quizId" value={quizId} /><input type="hidden" name="answers" id="answers" value="[]" /><div className="space-y-5">{questions.map((question) => { const choices = items.filter((item) => item.question_id === question.question_id); return <fieldset key={question.question_id} className="rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]"><legend className="font-semibold text-[#002f65]">{question.prompt}</legend><div className="mt-4 space-y-3">{choices.map((choice) => <label key={choice.choice_id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#d5e9ed] p-3 text-sm text-[#526b78] hover:border-[#007c8b]"><input type="radio" name={`question-${question.question_id}`} value={choice.choice_id} onChange={() => { const hidden = document.getElementById("answers") as HTMLInputElement; const current = JSON.parse(hidden.value) as Array<{ question_id: string; choice_id: string }>; hidden.value = JSON.stringify([...current.filter((answer) => answer.question_id !== question.question_id), { question_id: question.question_id, choice_id: choice.choice_id }]); }} required />{choice.choice_text}</label>)}</div></fieldset>; })}</div><button disabled={pending} className="rounded-xl bg-[#002f65] px-6 py-3 font-semibold text-white disabled:opacity-60">{pending ? "Submitting…" : "Submit assessment"}</button>{state.error && <p className="text-sm text-red-700" role="alert">{state.error}</p>}{state.result && <div className={`rounded-2xl p-5 ${state.result.passed ? "bg-[#e4f7ec] text-[#145c36]" : "bg-[#fff0ef] text-[#9d2c25]"}`}><p className="font-semibold">{state.result.passed ? "Assessment passed" : "Assessment not passed"}</p><p className="mt-1 text-sm">Score: {state.result.score_percentage}%</p></div>}</form>;
}
