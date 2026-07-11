import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CertificatePage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: certificate } = await supabase.from("certificates").select("certificate_number, issued_at, user_id, courses(title)").eq("id", certificateId).maybeSingle();
  if (!certificate) notFound();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", certificate.user_id).maybeSingle();
  const course = Array.isArray(certificate.courses) ? certificate.courses[0] : certificate.courses;
  return <main className="mx-auto max-w-3xl px-6 py-20 text-center"><div className="rounded-[2rem] border-8 border-[#d9f2f4] bg-white p-10 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#007c8b]">Certificate of completion</p><h1 className="mt-8 text-4xl font-semibold text-[#002f65]">{course?.title}</h1><p className="mt-6 text-[#526b78]">This certifies that</p><p className="mt-2 text-2xl font-semibold text-[#002f65]">{profile?.full_name || "Training participant"}</p><p className="mt-6 text-sm text-[#526b78]">Completed on {new Date(certificate.issued_at).toLocaleDateString()}</p><p className="mt-8 font-mono text-xs text-[#007c8b]">{certificate.certificate_number}</p></div></main>;
}
