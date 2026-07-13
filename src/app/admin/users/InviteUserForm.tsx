"use client";

import { useActionState } from "react";
import { inviteUser, type UserActionState } from "@/app/actions/admin";

export function InviteUserForm() {
  const [state, action, pending] = useActionState(inviteUser, {} as UserActionState);

  if (state.success) {
    return (
      <div className="rounded-xl bg-[#e4f7ec] px-4 py-3 text-sm font-medium text-[#145c36]">
        Invitation sent to {state.email}. They will receive a link to set their password.
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium text-[#526b78]" htmlFor="invite-email">Email address</label>
        <input
          id="invite-email"
          name="email"
          type="email"
          required
          placeholder="staff@ekagracare.com"
          className="mt-1 w-full rounded-xl border border-[#d5e9ed] px-3 py-2 text-sm outline-none focus:border-[#007c8b]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#526b78]" htmlFor="invite-role">Role</label>
        <select
          id="invite-role"
          name="role"
          className="mt-1 w-full rounded-xl border border-[#d5e9ed] bg-white px-3 py-2 text-sm outline-none focus:border-[#007c8b]"
        >
          <option value="learner">Learner</option>
          <option value="instructor">Instructor</option>
          <option value="administrator">Administrator</option>
        </select>
      </div>
      <button
        disabled={pending}
        className="shrink-0 rounded-xl bg-[#002f65] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001f43] disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send invite"}
      </button>
      {state.error && <p className="mt-1 text-xs text-red-700">{state.error}</p>}
    </form>
  );
}
