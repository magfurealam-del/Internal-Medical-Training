"use client";

import { useActionState, useState } from "react";
import { updateCourse, updateModule, updateLesson, type CourseActionState } from "@/app/actions/admin";

function InlineEditShell({
  label,
  children,
  onClose,
  state,
}: {
  label: string;
  children: React.ReactNode;
  onClose: () => void;
  state: CourseActionState;
}) {
  return (
    <div className="mt-3 rounded-xl border border-[#d5e9ed] bg-[#f6feff] p-4">
      <p className="mb-3 text-sm font-semibold text-[#002f65]">{label}</p>
      {children}
      {state.error && <p className="mt-2 text-xs text-red-700">{state.error}</p>}
      {state.success && <p className="mt-2 text-xs font-medium text-green-700">✓ Saved.</p>}
      <button
        type="button"
        onClick={onClose}
        className="mt-3 text-xs text-[#526b78] hover:text-[#002f65]"
      >
        Close
      </button>
    </div>
  );
}

export function EditCourseForm({
  courseId,
  title,
  description,
}: {
  courseId: string;
  title: string;
  description: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateCourse, {} as CourseActionState);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-[#d5e9ed] px-3 py-1.5 text-xs font-medium text-[#526b78] transition hover:border-[#007c8b] hover:text-[#007c8b]"
      >
        Edit details
      </button>
      {open && (
        <InlineEditShell label="Edit course" onClose={() => setOpen(false)} state={state}>
          <form action={action} className="space-y-3">
            <input type="hidden" name="courseId" value={courseId} />
            <div>
              <label className="block text-xs font-medium text-[#526b78]">Title</label>
              <input
                name="title"
                defaultValue={title}
                required
                className="mt-1 w-full rounded-lg border border-[#d5e9ed] px-3 py-2 text-sm outline-none focus:border-[#007c8b]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#526b78]">Description</label>
              <textarea
                name="description"
                defaultValue={description ?? ""}
                rows={3}
                className="mt-1 w-full rounded-lg border border-[#d5e9ed] px-3 py-2 text-sm outline-none focus:border-[#007c8b]"
              />
            </div>
            <button
              disabled={pending}
              className="rounded-lg bg-[#007c8b] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </form>
        </InlineEditShell>
      )}
    </div>
  );
}

export function EditModuleForm({
  moduleId,
  courseId,
  title,
  description,
  sortOrder,
}: {
  moduleId: string;
  courseId: string;
  title: string;
  description: string | null;
  sortOrder: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateModule, {} as CourseActionState);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-[#d5e9ed] px-2 py-1 text-xs text-[#526b78] transition hover:border-[#007c8b] hover:text-[#007c8b]"
      >
        Edit
      </button>
      {open && (
        <InlineEditShell label="Edit module" onClose={() => setOpen(false)} state={state}>
          <form action={action} className="space-y-3">
            <input type="hidden" name="moduleId" value={moduleId} />
            <input type="hidden" name="courseId" value={courseId} />
            <div>
              <label className="block text-xs font-medium text-[#526b78]">Title</label>
              <input
                name="title"
                defaultValue={title}
                required
                className="mt-1 w-full rounded-lg border border-[#d5e9ed] px-3 py-2 text-sm outline-none focus:border-[#007c8b]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#526b78]">Description</label>
              <input
                name="description"
                defaultValue={description ?? ""}
                className="mt-1 w-full rounded-lg border border-[#d5e9ed] px-3 py-2 text-sm outline-none focus:border-[#007c8b]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#526b78]">Sort order</label>
              <input
                name="sort_order"
                type="number"
                defaultValue={sortOrder}
                className="mt-1 w-24 rounded-lg border border-[#d5e9ed] px-3 py-2 text-sm outline-none focus:border-[#007c8b]"
              />
            </div>
            <button
              disabled={pending}
              className="rounded-lg bg-[#007c8b] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </form>
        </InlineEditShell>
      )}
    </div>
  );
}

export function EditLessonForm({
  lessonId,
  courseId,
  title,
  contentPath,
  sortOrder,
}: {
  lessonId: string;
  courseId: string;
  title: string;
  contentPath: string;
  sortOrder: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateLesson, {} as CourseActionState);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-[#d5e9ed] px-2 py-1 text-xs text-[#526b78] transition hover:border-[#007c8b] hover:text-[#007c8b]"
      >
        Edit
      </button>
      {open && (
        <InlineEditShell label="Edit lesson" onClose={() => setOpen(false)} state={state}>
          <form action={action} className="space-y-3">
            <input type="hidden" name="lessonId" value={lessonId} />
            <input type="hidden" name="courseId" value={courseId} />
            <div>
              <label className="block text-xs font-medium text-[#526b78]">Title</label>
              <input
                name="title"
                defaultValue={title}
                required
                className="mt-1 w-full rounded-lg border border-[#d5e9ed] px-3 py-2 text-sm outline-none focus:border-[#007c8b]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#526b78]">Content path</label>
              <input
                name="content_path"
                defaultValue={contentPath}
                required
                placeholder="courses/slug/module-01/lesson-01.md"
                className="mt-1 w-full rounded-lg border border-[#d5e9ed] px-3 py-2 font-mono text-xs outline-none focus:border-[#007c8b]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#526b78]">Sort order</label>
              <input
                name="sort_order"
                type="number"
                defaultValue={sortOrder}
                className="mt-1 w-24 rounded-lg border border-[#d5e9ed] px-3 py-2 text-sm outline-none focus:border-[#007c8b]"
              />
            </div>
            <button
              disabled={pending}
              className="rounded-lg bg-[#007c8b] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </form>
        </InlineEditShell>
      )}
    </div>
  );
}
