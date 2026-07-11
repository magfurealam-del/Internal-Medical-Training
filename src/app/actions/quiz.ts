"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function submitQuiz(_previousState: QuizState, formData: FormData): Promise<QuizState> {
  const quizId = String(formData.get("quizId") ?? "");
  const rawAnswers = String(formData.get("answers") ?? "[]");
  if (!quizId) return { error: "Quiz ID is missing." };

  let answers: unknown;
  try { answers = JSON.parse(rawAnswers); } catch { return { error: "Invalid quiz submission." }; }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("submit_quiz_attempt", { p_quiz_id: quizId, p_answers: answers });
  if (error) return { error: error.message };
  return { result: data as { attempt_id: string; score_percentage: number; passed: boolean } };
}

export type QuizState = { error?: string; result?: { attempt_id: string; score_percentage: number; passed: boolean } };
