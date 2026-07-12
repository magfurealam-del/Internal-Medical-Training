"use client";

import { useActionState, useState } from "react";
import { unenrollLearner, updateEnrollmentDeadline, type CourseActionState } from "@/app/actions/admin";

export function UpdateDeadlineForm({
  enrollmentId,
  courseId,
  currentExpiry,
}: {
  enrollmentId: string;
  courseId: string;
  currentExpiry: string | null;
}) {
  const [state, action, pending] = useActionState(updateEnrollmentDeadline, {} as CourseActionState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg px-2 py-1 text-xs text-[#526b78] hover:bg-[#f0f4f5] hover:text-[#007c8b]"
      >
        Edit deadline
      </button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-2" onSubmit={() => setOpen(false)}>
      <input type="hidden" name="enrollmentId" value={enrollmentId} />
      <input type="hidden" name="courseId" value={courseId} />
      <input
        name="expires_at"
        type="date"
        defaultValue={currentExpiry ? currentExpiry.slice(0, 10) : ""}
        className="rounded-lg border border-[#d5e9ed] px-2 py-1 text-xs outline-none focus:border-[#007c8b]"
      />
      <button
        disabled={pending}
        className="rounded-lg bg-[#007c8b] px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
      >
        {pending ? "…" : "Save"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-[#526b78] hover:text-[#002f65]">
        Cancel
      </button>
      {state.error && <span className="text-xs text-red-700">{state.error}</span>}
    </form>
  );
}

export function UnenrollButton({ enrollmentId, courseId }: { enrollmentId: string; courseId: string }) {
  const [state, action, pending] = useActionState(unenrollLearner, {} as CourseActionState);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-lg px-2 py-1 text-xs text-[#9d2c25] hover:bg-[#fff0ef]"
      >
        Remove
      </button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="enrollmentId" value={enrollmentId} />
      <input type="hidden" name="courseId" value={courseId} />
      <span className="text-xs text-[#9d2c25]">Remove?</span>
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
