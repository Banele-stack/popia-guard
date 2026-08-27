/**
 * Cross-domain date/format helpers shared by operators, processing
 * activities, assessments and breaches.
 *
 * Anchored to the real clock, evaluated fresh on every call — mirrors
 * popia-guard-api's src/common/status.util.ts exactly so the API's numbers
 * agree with the UI's own client-side badge logic.
 */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function today(): Date {
  return new Date(`${todayIso()}T00:00:00Z`);
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Whole days from today to the given ISO date. Negative means in the past. */
export function daysUntil(isoDate: string): number {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return Math.round((d.getTime() - today().getTime()) / MS_PER_DAY);
}

export function formatDaysRemaining(daysRemaining: number): string {
  if (daysRemaining < 0) {
    const overdue = Math.abs(daysRemaining);
    return `Overdue by ${overdue} day${overdue === 1 ? "" : "s"}`;
  }
  if (daysRemaining === 0) return "Due today";
  return `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`;
}

export function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
