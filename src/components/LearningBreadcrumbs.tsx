import Link from "next/link";

type Crumb = { label: string; href?: string };

export function LearningBreadcrumbs({ items }: { items: Crumb[] }) {
  return <nav aria-label="Learning breadcrumbs" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[#78909d]">{items.map((item, index) => <span key={`${item.label}-${index}`} className="flex items-center gap-2">{index > 0 && <span aria-hidden="true">/</span>}{item.href ? <Link href={item.href} className="transition hover:text-[#007c8b]">{item.label}</Link> : <span className="font-medium text-[#526b78]">{item.label}</span>}</span>)}</nav>;
}
