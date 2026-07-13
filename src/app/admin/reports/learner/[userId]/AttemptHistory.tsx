"use client";

import { useState } from "react";
import type { AttemptAnswerDetail } from "@/lib/training/courses";

type Attempt = {
  id: string;
  quiz_id: string;
  quiz_title: string;
  score_percentage: number;
  passed: boolean;
  submitted_at: string;
  answers: AttemptAnswerDetail[];
};

export function AttemptHistory({ attempts }: { attempts: Attempt[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="mt-4 space-y-3">
      {attempts.map((attempt) => {
        const isOpen = expanded === attempt.id;
        const correct = attempt.answers.filter((a) => a.is_correct).length;
        const total = attempt.answers.length;

        return (
          <div
            key={attempt.id}
            className={`rounded-2xl ring-1 transition ${attempt.passed ? "ring-[#a8dfc0]" : "ring-[#f5c6c0]"}`}
          >
            {/* Attempt summary row */}
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : attempt.id)}
              className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left hover:bg-[#f9feff]"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-semibold text-[#002f65]">{attempt.quiz_title}</p>
                  <p className="mt-0.5 text-xs text-[#526b78]">
                    {new Date(attempt.submitted_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#002f65]">{attempt.score_percentage}%</span>
                {total > 0 && (
                  <span className="text-xs text-[#526b78]">{correct}/{total} correct</span>
                )}
                {attempt.passed ? (
                  <span className="rounded-full bg-[#e4f7ec] px-2.5 py-1 text-xs font-semibold text-[#145c36]">Passed</span>
                ) : (
                  <span className="rounded-full bg-[#fff0ef] px-2.5 py-1 text-xs font-semibold text-[#9d2c25]">Not passed</span>
                )}
                <span className="text-xs text-[#007c8b]">{isOpen ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Per-question breakdown */}
            {isOpen && attempt.answers.length > 0 && (
              <div className="border-t border-[#edf4f5] px-5 pb-5">
                <div className="mt-4 space-y-3">
                  {attempt.answers.map((ans, i) => (
                    <div
                      key={ans.question_id}
                      className={`rounded-xl p-4 ${ans.is_correct ? "bg-[#f0faf5] ring-1 ring-[#a8dfc0]" : "bg-[#fff8f7] ring-1 ring-[#f5c6c0]"}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${ans.is_correct ? "bg-[#007c8b] text-white" : "bg-[#c0392b] text-white"}`}>
                          {ans.is_correct ? "✓" : "✗"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#002f65]">
                            <span className="mr-1.5 text-xs text-[#526b78]">{i + 1}.</span>
                            {ans.prompt}
                          </p>
                          <div className="mt-2 space-y-1 text-xs">
                            <p className={ans.is_correct ? "text-[#145c36]" : "text-[#9d2c25]"}>
                              <span className="font-medium">Selected: </span>
                              {ans.selected_choice_text ?? "No answer"}
                            </p>
                            {!ans.is_correct && ans.correct_choice_text && (
                              <p className="text-[#145c36]">
                                <span className="font-medium">Correct: </span>
                                {ans.correct_choice_text}
                              </p>
                            )}
                            {ans.explanation && (
                              <p className="mt-1 rounded-lg bg-white px-3 py-2 text-[#526b78] ring-1 ring-[#d5e9ed]">
                                <span className="font-medium">Explanation: </span>
                                {ans.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isOpen && attempt.answers.length === 0 && (
              <p className="border-t border-[#edf4f5] px-5 py-4 text-sm text-[#526b78]">No answer detail available for this attempt.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
