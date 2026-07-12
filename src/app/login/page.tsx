import Link from "next/link";

export default function LoginPage() {
  return <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Public preview</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Sign-in is temporarily paused</h1><p className="mt-4 text-[#526b78]">Course 1 is currently available for open reading without an account. Learner progress, certificates, and staff tools will return when sign-in is re-enabled.</p><Link href="/courses" className="mt-8 rounded-xl bg-[#002f65] px-4 py-3 text-center font-semibold text-white">Browse the course</Link></main>;
}
