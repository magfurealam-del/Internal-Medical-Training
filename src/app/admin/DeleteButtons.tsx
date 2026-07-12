"use client";

import { useActionState, useState } from "react";
import {
  deleteModule,
  deleteLesson,
  deleteQuestion,
  deleteChoice,
  reorderModule,
  reorderLesson,
  type CourseActionState,
} from "@/app/actions/admin";

function ConfirmDeleteButton({
  action,
  hiddenFields,
  label = "Delete",
}: {
  action: (prev: CourseActionState, formData: FormData) => Promise<CourseActionState>;
  hiddenFields: Record<string, string>;
  label?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as CourseActionState);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg px-2 py-1 text-xs text-[#9d2c25] transition hover:bg-[#fff0ef]"
      >
        {label}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <span className="text-xs text-[#9d2c25]">Delete?</span>
      <button
        disabled={pending}
        className="rounded-lg bg-[#9d2c25] px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
      >
        {pending ? "…" : "Yes"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-xs text-[#526b78]">
        No
      </button>
      {state.error && <span className="text-xs text-red-700">{state.error}</span>}
    </form>
  );
}

function ReorderButton({
  action,
  hiddenFields,
  direction,
  disabled,
}: {
  action: (prev: CourseActionState, formData: FormData) => Promise<CourseActionState>;
  hiddenFields: Record<string, string>;
  direction: "up" | "down";
  disabled?: boolean;
}) {
  const [, formAction, pending] = useActionState(action, {} as CourseActionState);
  return (
    <form action={formAction}>
      {Object.entries({ ...hiddenFields, direction }).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        disabled={disabled || pending}
        className="flex h-6 w-6 items-center justify-center rounded text-[#526b78] transition hover:bg-[#edf7f8] hover:text-[#007c8b] disabled:opacity-25"
        title={direction === "up" ? "Move up" : "Move down"}
      >
        {direction === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}

export function ModuleControls({
  moduleId,
  courseId,
  isFirst,
  isLast,
}: {
  moduleId: string;
  courseId: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <ReorderButton
        action={reorderModule}
        hiddenFields={{ moduleId, courseId }}
        direction="up"
        disabled={isFirst}
      />
      <ReorderButton
        action={reorderModule}
        hiddenFields={{ moduleId, courseId }}
        direction="down"
        disabled={isLast}
      />
      <ConfirmDeleteButton
        action={deleteModule}
        hiddenFields={{ moduleId, courseId }}
        label="Delete"
      />
    </div>
  );
}

export function LessonControls({
  lessonId,
  moduleId,
  courseId,
  isFirst,
  isLast,
}: {
  lessonId: string;
  moduleId: string;
  courseId: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <ReorderButton
        action={reorderLesson}
        hiddenFields={{ lessonId, moduleId, courseId }}
        direction="up"
        disabled={isFirst}
      />
      <ReorderButton
        action={reorderLesson}
        hiddenFields={{ lessonId, moduleId, courseId }}
        direction="down"
        disabled={isLast}
      />
      <ConfirmDeleteButton
        action={deleteLesson}
        hiddenFields={{ lessonId, courseId }}
        label="Delete"
      />
    </div>
  );
}

export function DeleteQuestionButton({
  questionId,
  quizId,
  courseId,
}: {
  questionId: string;
  quizId: string;
  courseId: string;
}) {
  return (
    <ConfirmDeleteButton
      action={deleteQuestion}
      hiddenFields={{ questionId, quizId, courseId }}
      label="Delete question"
    />
  );
}

export function DeleteChoiceButton({
  choiceId,
  questionId,
  quizId,
  courseId,
}: {
  choiceId: string;
  questionId: string;
  quizId: string;
  courseId: string;
}) {
  return (
    <ConfirmDeleteButton
      action={deleteChoice}
      hiddenFields={{ choiceId, questionId, quizId, courseId }}
      label="×"
    />
  );
}
