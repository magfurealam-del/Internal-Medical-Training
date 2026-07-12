"use client";

import { useActionState } from "react";
import { assignCourseToAudienceGroup, type CourseActionState } from "@/app/actions/admin";
import type { AudienceGroup } from "@/lib/training/courses";

export default function BulkEnrollmentForm({ courseId, groups }: { courseId: string; groups: AudienceGroup[] }) {
  const [state, action, pending] = useActionState(assignCourseToAudienceGroup, {} as CourseActionState);

  return (
    <form action={action} className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
      <input type="hidden" name="courseId" value={courseId} />
      <select
        name="audienceGroupId"
        required
        defaultValue=""
        className="rounded-xl border border-[#d5e9ed] px-4 py-3 text-sm text-[#002f65] outline-none focus:border-[#007c8b]"
      >
        <option value="" disabled>Select audience group</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>
      <input
        name="expiresAt"
        type="date"
        className="rounded-xl border border-[#d5e9ed] px-4 py-3 text-sm outline-none focus:border-[#007c8b]"
        title="Deadline (optional)"
      />
      <button
        disabled={pending}
        className="rounded-xl bg-[#007c8b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006b78] disabled:opacity-60"
      >
        {pending ? "Enrolling…" : "Enroll group"}
      </button>
      {state.error && <p className="text-sm text-red-700 md:col-span-3">{state.error}</p>}
      {state.success && <p className="text-sm font-medium text-green-700 md:col-span-3">✓ Group enrolled successfully.</p>}
    </form>
  );
}
