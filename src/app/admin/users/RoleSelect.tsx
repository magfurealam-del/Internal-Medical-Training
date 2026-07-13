"use client";

import { useActionState } from "react";
import { updateUserRole, type UserActionState } from "@/app/actions/admin";

export function RoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [state, action, pending] = useActionState(updateUserRole, {} as UserActionState);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        disabled={pending}
        onChange={(e) => {
          const form = e.currentTarget.closest("form") as HTMLFormElement | null;
          form?.requestSubmit();
        }}
        className="rounded-lg border border-[#d5e9ed] bg-white px-2 py-1 text-xs outline-none focus:border-[#007c8b] disabled:opacity-60"
      >
        <option value="learner">Learner</option>
        <option value="instructor">Instructor</option>
        <option value="administrator">Administrator</option>
      </select>
      {pending && <span className="text-xs text-[#526b78]">Saving…</span>}
      {state.success && <span className="text-xs font-medium text-[#145c36]">✓</span>}
      {state.error && <span className="text-xs text-red-700">{state.error}</span>}
    </form>
  );
}
