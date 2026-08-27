"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Minus } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { todayIso } from "@/lib/utils";
import type { ChecklistItemStatus } from "@/lib/types";

const CHECKLIST_TEMPLATE = [
  { id: "operator-agreements", label: "Every operator has a signed s21 agreement on file", description: "POPIA s21 requires a written agreement with anyone processing data on your behalf." },
  { id: "ropa-current", label: "The ROPA is reviewed and up to date", description: "Every processing activity reflects what's actually happening today." },
  { id: "breach-procedure", label: "A documented breach-response procedure exists", description: "Staff know what to do and who to notify if a breach happens." },
  { id: "paia-manual", label: "PAIA manual is published and current", description: "Required public document describing how to request access to information you hold." },
  { id: "staff-training", label: "Staff have received POPIA awareness training in the last 12 months", description: "Especially anyone handling personal information day-to-day." },
  { id: "consent-records", label: "Consent is properly recorded where it's the legal basis for processing", description: "A verbal or implied consent isn't enough on its own." },
  { id: "access-controls", label: "Access to personal information is restricted to those who need it", description: "Not everyone in the business should be able to open the HR/payroll folder." },
];

type ChecklistState = Record<string, ChecklistItemStatus>;

const STATUS_OPTIONS: { value: ChecklistItemStatus; label: string; icon: typeof Check }[] = [
  { value: "Pass", label: "Pass", icon: Check },
  { value: "Fail", label: "Fail", icon: X },
  { value: "N/A", label: "N/A", icon: Minus },
];

function statusButtonClasses(active: boolean, value: ChecklistItemStatus) {
  if (!active) {
    return "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]";
  }
  if (value === "Pass") {
    return "border-[var(--status-good-border)] bg-[var(--status-good-bg)] text-[var(--status-good-text)]";
  }
  if (value === "Fail") {
    return "border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] text-[var(--status-critical-text)]";
  }
  return "border-[var(--status-neutral-border)] bg-[var(--status-neutral-bg)] text-[var(--status-neutral-text)]";
}

export default function NewAssessmentPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [assessorName, setAssessorName] = useState("");
  const [date, setDate] = useState(todayIso);
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  const [checklist, setChecklist] = useState<ChecklistState>(() =>
    Object.fromEntries(CHECKLIST_TEMPLATE.map((c) => [c.id, "Pass" as ChecklistItemStatus]))
  );

  const failCount = Object.values(checklist).filter((v) => v === "Fail").length;

  function setItemStatus(id: string, status: ChecklistItemStatus) {
    setChecklist((prev) => ({ ...prev, [id]: status }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          assessorName,
          date,
          area,
          notes,
          checklist: CHECKLIST_TEMPLATE.map((c) => ({
            id: c.id,
            label: c.label,
            status: checklist[c.id],
            note: notesById[c.id],
          })),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message ?? "Failed to submit assessment.");
      }
      showToast("Assessment submitted. Redirecting...");
      window.setTimeout(() => router.push(`/assessments/${body.id}`), 900);
    } catch (err) {
      setSubmitting(false);
      showToast(err instanceof Error ? err.message : "Failed to submit assessment.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/assessments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
        Back to assessments
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">New POPIA Self-Assessment</h1>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Any item marked Fail automatically raises an open finding for follow-up.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Assessment details</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="title" className="text-xs font-medium text-[var(--foreground-muted)]">
                Title
              </label>
              <input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q1 2027 POPIA Self-Assessment"
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="assessorName" className="text-xs font-medium text-[var(--foreground-muted)]">
                Assessor name
              </label>
              <input
                id="assessorName"
                required
                value={assessorName}
                onChange={(e) => setAssessorName(e.target.value)}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="date" className="text-xs font-medium text-[var(--foreground-muted)]">
                Date
              </label>
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="area" className="text-xs font-medium text-[var(--foreground-muted)]">
                Area covered
              </label>
              <input
                id="area"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Organization-wide, HR, IT Security"
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Checklist</h2>
            {failCount > 0 ? (
              <span
                className="rounded-full border border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] px-2.5 py-1 text-xs font-semibold"
                style={{ color: "var(--status-critical-text)" }}
              >
                {failCount} item{failCount > 1 ? "s" : ""} flagged
              </span>
            ) : null}
          </div>

          <ul className="mt-4 divide-y divide-[var(--border)]">
            {CHECKLIST_TEMPLATE.map((checkItem) => (
              <li key={checkItem.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{checkItem.label}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">{checkItem.description}</p>
                  </div>
                  <div role="radiogroup" aria-label={checkItem.label} className="flex shrink-0 gap-1.5">
                    {STATUS_OPTIONS.map((option) => {
                      const active = checklist[checkItem.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setItemStatus(checkItem.id, option.value)}
                          className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${statusButtonClasses(
                            active,
                            option.value
                          )}`}
                        >
                          <option.icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {checklist[checkItem.id] === "Fail" && (
                  <input
                    value={notesById[checkItem.id] ?? ""}
                    onChange={(e) => setNotesById((prev) => ({ ...prev, [checkItem.id]: e.target.value }))}
                    placeholder="What's actually wrong here?"
                    className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <label htmlFor="notes" className="text-sm font-semibold text-[var(--foreground)]">
            Overall notes
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit assessment"}
        </button>
      </form>
    </div>
  );
}
