import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CertificatePage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("certificate_number, issued_at, user_id, courses(title, description)")
    .eq("id", certificateId)
    .maybeSingle();
  if (!certificate) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", certificate.user_id)
    .maybeSingle();

  const course = Array.isArray(certificate.courses) ? certificate.courses[0] : certificate.courses;
  const issuedDate = new Date(certificate.issued_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#f5fbfc] px-6 py-12 lg:px-10">
      {/* Actions bar — hidden on print */}
      <div className="mx-auto mb-8 flex max-w-3xl items-center justify-between print:hidden">
        <Link href="/certificates" className="text-sm font-medium text-[#007c8b]">
          ← All certificates
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-xl bg-[#002f65] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001f43]"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Certificate card */}
      <div
        id="certificate"
        className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-[#d5e9ed] print:shadow-none print:ring-0"
      >
        {/* Teal header band */}
        <div className="bg-[#002f65] px-10 py-8 text-center">
          {/* Logo area */}
          <div className="flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ekagra-logo.png" alt="Ekagra Hospital" className="h-12 w-auto brightness-0 invert" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Advanced Wound and Foot Care Hospital
            </span>
          </div>
          <div className="mt-6 h-px bg-white/15" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#7bdcb5]">
            Certificate of Completion
          </p>
        </div>

        {/* Body */}
        <div className="px-10 py-12 text-center">
          <p className="text-sm text-[#526b78]">This is to certify that</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-[#002f65]">
            {profile?.full_name || "Training Participant"}
          </p>

          <p className="mt-8 text-sm text-[#526b78]">has successfully completed the training course</p>

          <div className="mx-auto mt-5 max-w-lg rounded-2xl bg-[#edf7f8] px-8 py-6">
            <p className="text-2xl font-semibold text-[#002f65]">{course?.title}</p>
            {course?.description && (
              <p className="mt-2 text-sm leading-6 text-[#526b78]">{course.description}</p>
            )}
          </div>

          <p className="mt-10 text-sm text-[#526b78]">
            Issued on <span className="font-semibold text-[#002f65]">{issuedDate}</span>
          </p>

          {/* Decorative divider */}
          <div className="mx-auto mt-10 flex max-w-sm items-center gap-4">
            <div className="h-px flex-1 bg-[#d5e9ed]" />
            <span className="text-[#9dd7de]">✦</span>
            <div className="h-px flex-1 bg-[#d5e9ed]" />
          </div>

          {/* Signature row */}
          <div className="mt-8 flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-12">
            <div className="text-center">
              <div className="font-serif text-xl italic text-[#002f65]">Ekagra Training</div>
              <div className="mt-1 h-px bg-[#d5e9ed]" />
              <p className="mt-1 text-xs text-[#526b78]">Authorised by</p>
            </div>
          </div>
        </div>

        {/* Footer band */}
        <div className="flex items-center justify-between bg-[#f6feff] px-10 py-5">
          <p className="font-mono text-xs text-[#526b78]">
            Certificate no. <span className="font-semibold text-[#002f65]">{certificate.certificate_number}</span>
          </p>
          <p className="text-xs text-[#526b78]">internal-medical-training.vercel.app</p>
        </div>
      </div>

      {/* Return CTA */}
      <div className="mx-auto mt-8 flex max-w-3xl justify-center gap-4 print:hidden">
        <Link
          href="/dashboard"
          className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#002f65] ring-1 ring-[#d5e9ed] transition hover:ring-[#007c8b]"
        >
          Back to dashboard
        </Link>
        <Link
          href="/courses"
          className="rounded-xl bg-[#007c8b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#006b78]"
        >
          Continue learning →
        </Link>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          @page { margin: 1cm; }
        }
      `}</style>
    </main>
  );
}
