import { notFound } from "next/navigation";
import { getQuiz } from "@/lib/training/quizzes";
import { getPreviousAttempt, getAttemptCount } from "@/lib/training/courses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import QuizForm from "./QuizForm";
import { LearningBreadcrumbs } from "@/components/LearningBreadcrumbs";

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const [{ quiz, items }, previousAttempt, attemptCount] = await Promise.all([
    getQuiz(quizId),
    getPreviousAttempt(quizId),
    getAttemptCount(quizId),
  ]);
  if (!quiz) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: quizRow } = await supabase.from("quizzes").select("module_id, course_id").eq("id", quizId).maybeSingle();
  const moduleId = quizRow?.module_id as string | null;
  const courseId = quizRow?.course_id as string;
  const returnHref = courseId && moduleId ? `/courses/${courseId}/modules/${moduleId}` : "/dashboard";

  const limitReached = quiz.attempt_limit !== null && attemptCount >= quiz.attempt_limit;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
      <LearningBreadcrumbs
        items={[
          { label: "My learning", href: "/dashboard" },
          ...(courseId && moduleId ? [{ label: "Back to module", href: returnHref }] : []),
          { label: "Assessment" },
        ]}
      />

      <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Assessment</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#002f65] sm:text-5xl">{quiz.title}</h1>

      {/* Meta row */}
      <div className="mt-5 flex flex-wrap gap-3">
        <span className="rounded-full bg-[#edf7f8] px-4 py-1.5 text-sm font-medium text-[#007c8b]">
          Pass mark: {quiz.pass_percentage}%
        </span>
        <span className="rounded-full bg-[#edf7f8] px-4 py-1.5 text-sm font-medium text-[#007c8b]">
          {items.length > 0 ? `${new Set(items.map((i) => i.question_id)).size} questions` : "No questions yet"}
        </span>
        {quiz.attempt_limit !== null && (
          <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${limitReached ? "bg-[#fff0ef] text-[#9d2c25]" : "bg-[#edf7f8] text-[#007c8b]"}`}>
            {attemptCount} / {quiz.attempt_limit} attempts used
          </span>
        )}
        {previousAttempt && (
          <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${previousAttempt.passed ? "bg-[#e4f7ec] text-[#145c36]" : "bg-[#fff0ef] text-[#9d2c25]"}`}>
            Previous: {previousAttempt.score_percentage}% — {previousAttempt.passed ? "Passed" : "Not passed"}
          </span>
        )}
      </div>

      {quiz.description && <p className="mt-4 text-[#526b78]">{quiz.description}</p>}

      {limitReached ? (
        <div className="mt-10 rounded-2xl bg-[#fff0ef] p-8 ring-1 ring-[#f5c6c0]">
          <p className="font-semibold text-[#9d2c25]">Attempt limit reached</p>
          <p className="mt-2 text-sm text-[#b03020]">
            You have used all {quiz.attempt_limit} attempt{quiz.attempt_limit !== 1 ? "s" : ""} for this assessment.
            Please contact your training coordinator if you need to retake it.
          </p>
          <a
            href={returnHref}
            className="mt-5 inline-block rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#002f65] ring-1 ring-[#d5e9ed] hover:ring-[#007c8b]"
          >
            ← Back to module
          </a>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[#9dd7de] bg-white p-10 text-center text-[#526b78]">
          Questions will appear here when the assessment is populated.
        </div>
      ) : (
        <QuizForm
          quizId={quiz.id}
          items={items}
          passPercentage={quiz.pass_percentage}
          returnHref={returnHref}
        />
      )}
    </main>
  );
}
