"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";

export default function ProfileForm({ currentName }: { currentName: string }) {
  const [state, action, pending] = useActionState(updateProfile, {} as ProfileState);

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#002f65]">
          Full name
          <span className="ml-1 text-xs font-normal text-[#526b78]">(appears on your certificates)</span>
        </label>
        <input
          name="full_name"
          defaultValue={currentName}
          required
          maxLength={100}
          className="mt-2 w-full rounded-xl border border-[#d5e9ed] px-4 py-3 text-sm text-[#002f65] outline-none focus:border-[#007c8b]"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          disabled={pending}
          className="rounded-xl bg-[#007c8b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006b78] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save name"}
        </button>
        {state.error && <p className="text-sm text-red-700">{state.error}</p>}
        {state.success && <p className="text-sm font-medium text-green-700">✓ Name updated.</p>}
      </div>
    </form>
  );
}
