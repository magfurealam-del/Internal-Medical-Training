import { createSupabaseServerClient } from "@/lib/supabase/server";

export type QuizItem = { question_id: string; quiz_id: string; prompt: string; question_type: string; sort_order: number; choice_id: string; choice_text: string; choice_sort_order: number };

export async function getQuiz(quizId: string) {
  const supabase = await createSupabaseServerClient();
  const [{ data: quiz, error: quizError }, { data: items, error: itemsError }] = await Promise.all([
    supabase.from("quizzes").select("id, title, description, pass_percentage").eq("id", quizId).maybeSingle(),
    supabase.from("quiz_items_public").select("question_id, quiz_id, prompt, question_type, sort_order, choice_id, choice_text, choice_sort_order").eq("quiz_id", quizId).order("sort_order").order("choice_sort_order"),
  ]);
  if (quizError) throw new Error(quizError.message);
  if (itemsError) throw new Error(itemsError.message);
  return { quiz, items: (items ?? []) as QuizItem[] };
}
