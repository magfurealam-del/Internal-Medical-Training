import { notFound } from "next/navigation";
import { getQuiz } from "@/lib/training/quizzes";
import QuizForm from "./QuizForm";
import { LearningBreadcrumbs } from "@/components/LearningBreadcrumbs";

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const { quiz, items } = await getQuiz(quizId);
  if (!quiz) notFound();
  return <main className="mx-auto max-w-4xl px-6 py-16 lg:px-10"><LearningBreadcrumbs items={[{ label: "My learning", href: "/dashboard" }, { label: "Assessment" }]} /><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Assessment</p><h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">{quiz.title}</h1><p className="mt-4 text-[#526b78]">{quiz.description ?? `Pass mark: ${quiz.pass_percentage}%`}</p>{items.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-[#9dd7de] bg-white p-10 text-center text-[#526b78]">Questions will appear here when the assessment is populated.</div> : <QuizForm quizId={quiz.id} items={items} />}</main>;
}
