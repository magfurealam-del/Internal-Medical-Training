export type DeadlineStatus = "overdue" | "urgent" | "soon" | "comfortable" | "none";

export function getDeadlineStatus(expiresAt: string | null): DeadlineStatus {
  if (!expiresAt) return "none";
  const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
  if (days < 0) return "overdue";
  if (days <= 3) return "urgent";
  if (days <= 14) return "soon";
  return "comfortable";
}

export function formatDeadline(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 14) return `Due in ${days} days`;
  return `Due ${new Date(expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

export const deadlineColors: Record<DeadlineStatus, string> = {
  overdue: "bg-[#fff0ef] text-[#9d2c25]",
  urgent:  "bg-[#fff0ef] text-[#9d2c25]",
  soon:    "bg-[#fff8e6] text-[#7c4a00]",
  comfortable: "bg-[#edf7f8] text-[#007c8b]",
  none:    "bg-[#edf7f8] text-[#526b78]",
};
