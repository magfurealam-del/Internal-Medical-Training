import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listCertificates } from "@/lib/training/courses";
import ProfileForm from "./ProfileForm";
import SignOutButton from "./SignOutButton";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/login");

  const [{ data: profile }, certificates] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", userId).maybeSingle(),
    listCertificates(),
  ]);

  const { data: authUser } = await supabase.auth.getUser();
  const email = authUser.user?.email ?? "";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
      <Link href="/dashboard" className="text-sm font-medium text-[#007c8b]">← Dashboard</Link>

      <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">Your account</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">Profile</h1>

      {/* Account details */}
      <section className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]">
        <h2 className="text-xl font-semibold text-[#002f65]">Account details</h2>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center gap-3 rounded-xl bg-[#f6feff] px-4 py-3">
            <span className="w-16 shrink-0 font-medium text-[#526b78]">Email</span>
            <span className="text-[#002f65]">{email}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[#f6feff] px-4 py-3">
            <span className="w-16 shrink-0 font-medium text-[#526b78]">Role</span>
            <span className="capitalize text-[#002f65]">{profile?.role ?? "learner"}</span>
          </div>
        </div>

        <div className="mt-6 border-t border-[#d5e9ed] pt-6">
          <h3 className="font-semibold text-[#002f65]">Display name</h3>
          <ProfileForm currentName={profile?.full_name ?? ""} />
        </div>
      </section>

      {/* Certificates */}
      <section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#002f65]">Certificates</h2>
          <Link href="/certificates" className="text-sm font-semibold text-[#007c8b]">View all →</Link>
        </div>
        {certificates.length === 0 ? (
          <p className="mt-4 text-sm text-[#526b78]">No certificates yet. Complete a course assessment to earn one.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {certificates.map((cert) => (
              <Link
                key={cert.id}
                href={`/certificates/${cert.id}`}
                className="flex items-center justify-between rounded-xl border border-[#d5e9ed] px-4 py-3 text-sm transition hover:border-[#007c8b]"
              >
                <span className="font-medium text-[#002f65]">{cert.course_title}</span>
                <span className="text-xs text-[#526b78]">
                  {new Date(cert.issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]">
        <h2 className="text-xl font-semibold text-[#002f65]">Session</h2>
        <p className="mt-2 text-sm text-[#526b78]">Sign out of your account on this device.</p>
        <SignOutButton />
      </section>
    </main>
  );
}
