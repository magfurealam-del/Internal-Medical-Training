"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendCertificateEmail } from "@/lib/training/email";

export async function submitQuiz(_previousState: QuizState, formData: FormData): Promise<QuizState> {
  const quizId = String(formData.get("quizId") ?? "");
  const rawAnswers = String(formData.get("answers") ?? "[]");
  if (!quizId) return { error: "Quiz ID is missing." };

  let answers: unknown;
  try { answers = JSON.parse(rawAnswers); } catch { return { error: "Invalid quiz submission." }; }
  if (!Array.isArray(answers) || answers.length === 0) return { error: "Please select an answer before submitting." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("submit_quiz_attempt", { p_quiz_id: quizId, p_answers: answers });
  if (error) return { error: error.message };

  const result = data as { attempt_id: string; score_percentage: number; passed: boolean };
  let certificateId: string | undefined;
  if (result.passed) {
    const certificate = await supabase.rpc("issue_certificate", { p_attempt_id: result.attempt_id });
    if (!certificate.error) {
      certificateId = certificate.data as string;
      // Send certificate email — best-effort, don't block the response
      try {
        const { data: claimsData } = await supabase.auth.getClaims();
        const userId = claimsData?.claims?.sub;
        if (userId && certificateId) {
          const [{ data: profile }, { data: userRecord }, { data: quiz }] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
            supabase.auth.admin.getUserById(userId),
            supabase.from("quizzes").select("courses(title)").eq("id", quizId).maybeSingle(),
          ]);
          const email = userRecord?.user?.email;
          const rawCourses = quiz?.courses as unknown;
          const courseTitle = (Array.isArray(rawCourses) ? (rawCourses[0] as { title: string } | undefined)?.title : (rawCourses as { title: string } | null)?.title);
          if (email && courseTitle) {
            await sendCertificateEmail({
              to: email,
              learnerName: profile?.full_name ?? "there",
              courseTitle,
              certificateId,
            });
          }
        }
      } catch {
        // Email failure must not block the quiz result
      }
    }
  }

  // Fetch post-submission review — safe because the attempt is already scored
  const review = await fetchAttemptReview(result.attempt_id);

  return { result: { ...result, certificate_id: certificateId }, review };
}

export async function fetchAttemptReview(attemptId: string): Promise<ReviewItem[]> {
  const supabase = await createSupabaseServerClient();

  const { data: answers } = await supabase
    .from("attempt_answers")
    .select("question_id, selected_choice_id, is_correct, questions(prompt, explanation, correct_choice_id, sort_order)")
    .eq("attempt_id", attemptId);

  if (!answers || answers.length === 0) return [];

  const typedAnswers = (answers as unknown) as AnswerRow[];
  const questionIds = typedAnswers.map((a) => a.question_id);
  const { data: choices } = await supabase
    .from("question_choices")
    .select("id, question_id, choice_text")
    .in("question_id", questionIds);


  const choiceMap = new Map((choices ?? []).map((c) => [c.id, c.choice_text]));

  return typedAnswers
    .sort((a, b) => {
      const aOrder = (a.questions as QuestionRow | null)?.sort_order ?? 0;
      const bOrder = (b.questions as QuestionRow | null)?.sort_order ?? 0;
      return aOrder - bOrder;
    })
    .map((answer) => {
      const q = answer.questions as QuestionRow | null;
      return {
        question_id: answer.question_id,
        prompt: q?.prompt ?? "",
        explanation: q?.explanation ?? null,
        correct_choice_id: q?.correct_choice_id ?? null,
        correct_choice_text: q?.correct_choice_id ? (choiceMap.get(q.correct_choice_id) ?? null) : null,
        selected_choice_id: answer.selected_choice_id ?? null,
        selected_choice_text: answer.selected_choice_id ? (choiceMap.get(answer.selected_choice_id) ?? null) : null,
        is_correct: answer.is_correct,
      };
    });
}

type AnswerRow = {
  question_id: string;
  selected_choice_id: string | null;
  is_correct: boolean;
  questions: QuestionRow | null;
};

type QuestionRow = {
  prompt: string;
  explanation: string | null;
  correct_choice_id: string | null;
  sort_order: number;
};

export type ReviewItem = {
  question_id: string;
  prompt: string;
  explanation: string | null;
  correct_choice_id: string | null;
  correct_choice_text: string | null;
  selected_choice_id: string | null;
  selected_choice_text: string | null;
  is_correct: boolean;
};

export type QuizState = {
  error?: string;
  result?: {
    attempt_id: string;
    score_percentage: number;
    passed: boolean;
    certificate_id?: string;
  };
  review?: ReviewItem[];
};
