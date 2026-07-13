"use client";

import { useActionState, useState } from "react";
import { submitQuiz, type QuizState, type ReviewItem } from "@/app/actions/quiz";
import type { QuizItem } from "@/lib/training/quizzes";

const initialState: QuizState = {};

export default function QuizForm({
  quizId,
  items,
  passPercentage,
  returnHref,
  nextModuleHref,
  courseHref,
}: {
  quizId: string;
  items: QuizItem[];
  passPercentage: number;
  returnHref: string;
  nextModuleHref: string | null;
  courseHref: string;
}) {
  const [state, formAction, pending] = useActionState(submitQuiz, initialState);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const questions = Array.from(new Map(items.map((item) => [item.question_id, item])).values());
  const answeredCount = Object.keys(answers).length;
  const progress = answeredCount === 0 ? 0 : Math.round((answeredCount / questions.length) * 100);
  const allAnswered = answeredCount === questions.length;
  const serialisedAnswers = JSON.stringify(
    Object.entries(answers).map(([question_id, choice_id]) => ({ question_id, choice_id }))
  );

  if (state.result) {
    const { passed, score_percentage, certificate_id } = state.result;
    const review = state.review ?? [];
    const correctCount = review.filter((item) => item.is_correct).length;
    const missedCount = review.length - correctCount;
    const analysis = passed
      ? missedCount === 0
        ? "You demonstrated complete mastery of this assessment.": "Your core understanding is strong. Review the missed mechanisms before moving to the next module."
      : "The result is below the pass mark. Use the explanations and remediation links in the lesson sequence, then retake the assessment.";
    return (
      <div className="mt-8 space-y-6">
        {/* Score card */}
        <div className={`rounded-2xl p-8 ${passed ? "bg-[#e4f7ec]" : "bg-[#fff0ef]"}`}>
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${passed ? "text-[#145c36]" : "text-[#9d2c25]"}`}>
            {passed ? "Assessment passed" : "Assessment not passed"}
          </p>
          <p className={`mt-3 text-5xl font-semibold ${passed ? "text-[#145c36]" : "text-[#9d2c25]"}`}>
            {score_percentage}%
          </p>
          <p className={`mt-2 text-sm ${passed ? "text-[#1a7040]" : "text-[#b03020]"}`}>
            {passed
              ? `Well done — you met the ${passPercentage}% pass mark.`
              : `You need ${passPercentage}% to pass. Review the questions below, then retry.`}
          </p>
        </div>

        <section className="rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]">
          <h2 className="text-xl font-semibold text-[#002f65]">Results and analysis</h2>
          <p className="mt-2 text-sm leading-6 text-[#526b78]">{analysis}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[#edf7f8] p-4"><p className="text-xs uppercase tracking-[0.14em] text-[#526b78]">Score</p><p className="mt-1 text-2xl font-semibold text-[#002f65]">{score_percentage}%</p></div>
            <div className="rounded-xl bg-[#f0faf5] p-4"><p className="text-xs uppercase tracking-[0.14em] text-[#526b78]">Correct</p><p className="mt-1 text-2xl font-semibold text-[#145c36]">{correctCount}</p></div>
            <div className="rounded-xl bg-[#fff8f7] p-4"><p className="text-xs uppercase tracking-[0.14em] text-[#526b78]">Review</p><p className="mt-1 text-2xl font-semibold text-[#9d2c25]">{missedCount}</p></div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {passed && nextModuleHref ? (
            <a
              href={nextModuleHref}
              className="flex-1 rounded-xl bg-[#002f65] px-6 py-3 text-center font-semibold text-white transition hover:bg-[#001f43]"
            >
              Next module →
            </a>
          ) : passed && !nextModuleHref ? (
            <a
              href={courseHref}
              className="flex-1 rounded-xl bg-[#002f65] px-6 py-3 text-center font-semibold text-white transition hover:bg-[#001f43]"
            >
              {certificate_id ? "View certificate →" : "Course complete →"}
            </a>
          ) : null}
          {certificate_id && passed && nextModuleHref && (
            <a
              href={`/certificates/${certificate_id}`}
              className="flex-1 rounded-xl bg-white px-6 py-3 text-center font-semibold text-[#002f65] ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"
            >
              View certificate
            </a>
          )}
          {!passed && (
            <>
              <a
                href={returnHref}
                className="flex-1 rounded-xl bg-white px-6 py-3 text-center font-semibold text-[#526b78] ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"
              >
                Review lessons
              </a>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 rounded-xl bg-[#007c8b] px-6 py-3 text-center font-semibold text-white transition hover:bg-[#006b78]"
              >
                Retry assessment
              </button>
            </>
          )}
        </div>

        {/* Answer review */}
        {review.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#002f65]">Question review</h2>
            {review.map((item, index) => (
              <ReviewCard key={item.question_id} item={item} index={index} />
            ))}
          </section>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="answers" value={serialisedAnswers} />

      {/* Progress bar */}
      <div
        className="rounded-2xl bg-[#edf7f8] p-5"
        aria-label={`Quiz progress: ${answeredCount} of ${questions.length} answered`}
      >
        <div className="flex justify-between text-sm font-medium text-[#526b78]">
          <span>{answeredCount} of {questions.length} answered</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white">
          <div className="h-2 rounded-full bg-[#007c8b] transition-all" style={{ width: `${progress}%` }} />
        </div>
        {allAnswered && (
          <p className="mt-3 text-sm font-medium text-[#007c8b]">All questions answered — ready to submit.</p>
        )}
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-5">
        {questions.map((question, questionIndex) => {
          const choices = items.filter((item) => item.question_id === question.question_id);
          const isAnswered = question.question_id in answers;
          return (
            <fieldset
              key={question.question_id}
              className={`rounded-2xl p-6 transition ${isAnswered ? "bg-white ring-1 ring-[#a8dfc0]" : "bg-white ring-1 ring-[#d5e9ed]"}`}
            >
              <legend className="font-semibold text-[#002f65]">
                <span className="mr-2 text-sm text-[#007c8b]">{questionIndex + 1}.</span>
                {question.prompt}
              </legend>
              <div className="mt-4 flex flex-col gap-2">
                {choices.map((choice) => (
                  <label
                    key={choice.choice_id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#d5e9ed] p-3.5 text-sm text-[#526b78] transition hover:border-[#007c8b] has-[:checked]:border-[#007c8b] has-[:checked]:bg-[#edf7f8] has-[:checked]:text-[#002f65]"
                  >
                    <input
                      type="radio"
                      name={`question-${question.question_id}`}
                      value={choice.choice_id}
                      className="accent-[#007c8b]"
                      onChange={() => {
                        setAnswers((prev) => ({ ...prev, [question.question_id]: choice.choice_id }));
                      }}
                    />
                    {choice.choice_text}
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>

      {state.error && (
        <p className="rounded-xl bg-[#fff0ef] px-4 py-3 text-sm text-red-700" role="alert">{state.error}</p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={returnHref}
          className="rounded-xl bg-white px-6 py-3 text-center font-semibold text-[#526b78] ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"
        >
          ← Back to module
        </a>
        <button
          disabled={pending || !allAnswered}
          className="flex-1 rounded-xl bg-[#002f65] px-6 py-3 font-semibold text-white transition hover:bg-[#001f43] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Submitting…" : `Submit assessment (${answeredCount}/${questions.length} answered)`}
        </button>
      </div>
    </form>
  );
}

function ReviewCard({ item, index }: { item: ReviewItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-2xl p-5 ${item.is_correct ? "bg-[#f0faf5] ring-1 ring-[#a8dfc0]" : "bg-[#fff8f7] ring-1 ring-[#f5c6c0]"}`}>
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            item.is_correct ? "bg-[#007c8b] text-white" : "bg-[#c0392b] text-white"
          }`}
        >
          {item.is_correct ? "✓" : "✗"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#002f65]">
            <span className="mr-2 text-sm text-[#526b78]">{index + 1}.</span>
            {item.prompt}
          </p>

          <div className="mt-3 space-y-1.5 text-sm">
            <p className={item.is_correct ? "text-[#145c36]" : "text-[#9d2c25]"}>
              <span className="font-medium">Your answer: </span>
              {item.selected_choice_text ?? "No answer"}
            </p>
            {!item.is_correct && item.correct_choice_text && (
              <p className="text-[#145c36]">
                <span className="font-medium">Correct answer: </span>
                {item.correct_choice_text}
              </p>
            )}
          </div>

          {item.explanation && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="text-xs font-semibold text-[#007c8b] underline-offset-2 hover:underline"
              >
                {open ? "Hide explanation ▲" : "Show explanation ▼"}
              </button>
              {open && (
                <p className="mt-2 rounded-xl bg-white px-4 py-3 text-sm leading-6 text-[#526b78] ring-1 ring-[#d5e9ed]">
                  {item.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
