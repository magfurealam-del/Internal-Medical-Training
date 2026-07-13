"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-xl bg-[#002f65] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001f43]"
    >
      Print / Save PDF
    </button>
  );
}
