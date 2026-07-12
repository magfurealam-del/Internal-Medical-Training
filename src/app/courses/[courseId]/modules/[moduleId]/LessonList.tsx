import Link from "next/link";
import type { Lesson } from "@/lib/training/courses";

export default function LessonList({
  courseId,
  moduleId,
  lessons,
  completedIds,
  quizId,
}: {
  courseId: string;
  moduleId: string;
  lessons: Lesson[];
  completedIds: string[];
  quizId?: string;
}) {
  const completed = new Set(completedIds);
  const firstIncompleteIndex = lessons.findIndex((l) => !completed.has(l.id));

  return (
    <div className="mt-5 flex flex-col gap-2">
      {lessons.map((lesson, index) => {
        const isDone = completed.has(lesson.id);
        const isNext = index === firstIncompleteIndex;

        return (
          <Link
            key={lesson.id}
            href={`/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
            className={`flex items-center gap-4 rounded-2xl p-5 transition ${
              isDone
                ? "bg-[#f0faf5] ring-1 ring-[#a8dfc0]"
                : isNext
                  ? "bg-white ring-2 ring-[#007c8b]"
                  : "bg-white ring-1 ring-[#d5e9ed] hover:ring-[#007c8b]"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                isDone ? "bg-[#007c8b] text-white" : isNext ? "bg-[#007c8b]/10 text-[#007c8b]" : "bg-[#f6feff] text-[#526b78]"
              }`}
            >
              {isDone ? "✓" : String(index + 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`font-semibold ${isDone ? "text-[#145c36]" : "text-[#002f65]"}`}>{lesson.title}</p>
              {isNext && !isDone && <p className="mt-0.5 text-xs font-medium text-[#007c8b]">Start here</p>}
            </div>
            {isDone ? (
              <span className="shrink-0 text-xs font-semibold text-[#007c8b]">Done</span>
            ) : isNext ? (
              <span className="shrink-0 rounded-lg bg-[#007c8b] px-3 py-1.5 text-xs font-semibold text-white">Open →</span>
            ) : (
              <span className="shrink-0 text-sm text-[#b0c8d0]">→</span>
            )}
          </Link>
        );
      })}

      {quizId && (
        <Link
          href={`/quiz/${quizId}`}
          className={`mt-2 flex items-center gap-4 rounded-2xl p-5 transition ${
            firstIncompleteIndex === -1
              ? "bg-[#002f65] text-white ring-0 hover:bg-[#001f43]"
              : "bg-white ring-1 ring-[#d5e9ed] opacity-60"
          }`}
        >
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${firstIncompleteIndex === -1 ? "bg-white/15 text-white" : "bg-[#f6feff] text-[#526b78]"}`}>
            ✦
          </span>
          <div className="min-w-0 flex-1">
            <p className={`font-semibold ${firstIncompleteIndex === -1 ? "text-white" : "text-[#002f65]"}`}>Module assessment</p>
            {firstIncompleteIndex === -1 ? (
              <p className="mt-0.5 text-xs text-white/65">All lessons complete — take the quiz</p>
            ) : (
              <p className="mt-0.5 text-xs text-[#526b78]">Complete all lessons to unlock</p>
            )}
          </div>
          {firstIncompleteIndex === -1 && <span className="shrink-0 text-sm font-semibold text-[#7bdcb5]">Start →</span>}
        </Link>
      )}
    </div>
  );
}
