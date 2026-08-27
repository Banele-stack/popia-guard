"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X, AlertCircle, ArrowRight, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { breachSeverityBadge, breachStatusBadge } from "@/lib/badges";
import { BREACH_SEVERITIES } from "@/lib/types";
import type { Breach } from "@/lib/types";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";

export default function BreachesPageClient({ breaches }: { breaches: Breach[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Breaches</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            {breaches.length} logged data breaches (POPIA s22). Reportable breaches must notify both the
            Information Regulator and affected data subjects.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
        >
          <Plus size={15} />
          Log Breach
        </button>
      </div>

      {breaches.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No breaches logged" description="Hopefully it stays that way." />
      ) : (
        <div className="scroll-x rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
                <th className="px-4 py-3 font-medium">Breach</th>
                <th className="px-4 py-3 font-medium">Discovered</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Regulator Notified</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {breaches.map((breach) => {
                const sBadge = breachSeverityBadge(breach.severity);
                const stBadge = breachStatusBadge(breach.status);
                const unreported = breach.severity === "Reportable" && !breach.regulatorNotified;
                return (
                  <tr
                    key={breach.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/breaches/${breach.id}`}
                        className="font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                      >
                        {breach.title}
                      </Link>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {breach.numberOfDataSubjectsAffected} data subject(s) affected
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)]">{formatDate(breach.dateDiscovered)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={sBadge.tone} label={sBadge.label} icon={sBadge.icon} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={stBadge.tone} label={stBadge.label} icon={stBadge.icon} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      {unreported ? (
                        <span className="text-xs font-semibold text-[var(--status-critical-text)]">Not yet</span>
                      ) : breach.regulatorNotified ? (
                        <span className="text-xs text-[var(--foreground-muted)]">
                          {breach.regulatorNotifiedDate ? formatDate(breach.regulatorNotifiedDate) : "Yes"}
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--foreground-muted)]">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/breaches/${breach.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
                      >
                        View
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {addOpen && (
        <LogBreachModal
          onClose={() => setAddOpen(false)}
          onAdded={() => {
            setAddOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function LogBreachModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<string>(BREACH_SEVERITIES[0]);
  const [dateDiscovered, setDateDiscovered] = useState("");
  const [description, setDescription] = useState("");
  const [categoryOfDataAffected, setCategoryOfDataAffected] = useState("");
  const [numberOfDataSubjectsAffected, setNumberOfDataSubjectsAffected] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/breaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          severity,
          dateDiscovered,
          description,
          categoryOfDataAffected,
          numberOfDataSubjectsAffected: Number(numberOfDataSubjectsAffected) || 0,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message ?? "Failed to log breach.");
      }
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log breach.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">Log a Data Breach</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Field label="Title">
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Severity">
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={inputClass}>
                {BREACH_SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date discovered">
              <input
                type="date"
                required
                value={dateDiscovered}
                onChange={(e) => setDateDiscovered(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="What happened">
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Data affected">
              <input
                required
                value={categoryOfDataAffected}
                onChange={(e) => setCategoryOfDataAffected(e.target.value)}
                placeholder="e.g. Names, ID numbers"
                className={inputClass}
              />
            </Field>
            <Field label="Number affected">
              <input
                type="number"
                min={0}
                required
                value={numberOfDataSubjectsAffected}
                onChange={(e) => setNumberOfDataSubjectsAffected(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {submitting ? "Logging…" : "Log breach"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[var(--foreground)]">{label}</label>
      {children}
    </div>
  );
}
