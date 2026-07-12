import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, getQuizWithQuestions } from "@/lib/training/courses";
import { requireTrainingStaff } from "@/lib/training/auth";
import QuestionForm from "./QuestionForm";
import ChoiceForm from "./ChoiceForm";
import SetCorrectChoiceForm from "./SetCorrectChoiceForm";
import { DeleteQuestionButton, DeleteChoiceButton } from "@/app/admin/DeleteButtons";

export default async function QuizManagementPage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>;
}) {
  await requireTrainingStaff();
  const { courseId, quizId } = await params;
  const [course, quizData] = await Promise.all([getCourse(courseId), getQuizWithQuestions(quizId)]);
  if (!course || !quizData) notFound();

  const { quiz, questions } = quizData;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
      <Link href={`/admin/courses/${courseId}`} className="text-sm font-medium text-[#007c8b]">
        ← {course.title}
      </Link>

      <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Quiz management</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#002f65]">{quiz.title}</h1>
      <p className="mt-2 text-sm text-[#526b78]">Pass mark: {quiz.pass_percentage}%</p>

      {/* Questions */}
      <div className="mt-10 space-y-6">
        {questions.length === 0 && (
          <p className="rounded-xl border border-dashed border-[#9dd7de] p-6 text-center text-sm text-[#526b78]">
            No questions yet. Add the first one below.
          </p>
        )}

        {questions.map((question, qi) => (
          <section key={question.id} className="rounded-2xl bg-white ring-1 ring-[#d5e9ed]">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#002f65] text-xs font-bold text-white">
                  {qi + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-[#002f65]">{question.prompt}</p>
                  {question.explanation && (
                    <p className="mt-1 text-sm italic text-[#526b78]">Explanation: {question.explanation}</p>
                  )}
                </div>
                <DeleteQuestionButton questionId={question.id} quizId={quizId} courseId={courseId} />
              </div>

              {/* Choices */}
              <div className="mt-5 space-y-2 pl-11">
                {question.choices.length === 0 ? (
                  <p className="text-sm text-[#b0c8d0]">No choices yet.</p>
                ) : (
                  question.choices.map((choice) => {
                    const isCorrect = choice.id === question.correct_choice_id;
                    return (
                      <div
                        key={choice.id}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ${
                          isCorrect
                            ? "bg-[#e4f7ec] ring-1 ring-[#a3dbbe]"
                            : "bg-[#f6feff] ring-1 ring-[#d5e9ed]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isCorrect ? (
                            <span className="text-[#145c36]">✓</span>
                          ) : (
                            <span className="text-[#b0c8d0]">○</span>
                          )}
                          <span className={isCorrect ? "font-semibold text-[#145c36]" : "text-[#002f65]"}>
                            {choice.choice_text}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isCorrect && (
                            <SetCorrectChoiceForm
                              courseId={courseId}
                              quizId={quizId}
                              questionId={question.id}
                              choiceId={choice.id}
                            />
                          )}
                          <DeleteChoiceButton
                            choiceId={choice.id}
                            questionId={question.id}
                            quizId={quizId}
                            courseId={courseId}
                          />
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Add choice form */}
                <div className="pt-2">
                  <ChoiceForm courseId={courseId} quizId={quizId} questionId={question.id} />
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Add question form */}
      <section className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]">
        <h2 className="font-semibold text-[#002f65]">Add question</h2>
        <QuestionForm courseId={courseId} quizId={quizId} />
      </section>
    </main>
  );
}
