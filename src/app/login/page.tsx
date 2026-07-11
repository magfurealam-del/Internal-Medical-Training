"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    setLoading(false);
    setMessage(error ? error.message : "Check your email for a secure sign-in link.");
  }

  return <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Welcome back</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Sign in to your learning space</h1><p className="mt-4 text-[#526b78]">Use your email address and we’ll send you a secure magic link.</p><form onSubmit={submit} className="mt-8 rounded-2xl border border-[#d5e9ed] bg-white p-6 shadow-sm"><label className="text-sm font-medium" htmlFor="email">Email address</label><input className="mt-2 w-full rounded-xl border border-[#b8dce1] px-4 py-3 outline-none focus:border-[#007c8b]" id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /><button className="mt-5 w-full rounded-xl bg-[#002f65] px-4 py-3 font-semibold text-white disabled:opacity-60" disabled={loading}>{loading ? "Sending…" : "Send secure sign-in link"}</button>{message && <p className="mt-4 text-sm text-[#526b78]" role="status">{message}</p>}</form></main>;
}
