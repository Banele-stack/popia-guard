"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { todayIso } from "@/lib/utils";
import type { Breach, BreachStatus } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";

const STATUSES: BreachStatus[] = ["Open", "Contained", "Investigating", "Closed"];

export default function BreachActionsPanel({ breach }: { breach: Breach }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function patch(body: Record<string, unknown>, successMessage: string) {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/breaches/${breach.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const responseBody = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(responseBody.message ?? "Failed to update breach.");
      }
      showToast(successMessage);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update breach.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Status &amp; Notifications</h2>

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4">
        <p className="mb-1.5 text-xs font-medium text-[var(--foreground-muted)]">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={submitting}
              onClick={() => patch({ status: s }, `Marked as ${s}.`)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                breach.status === s
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <NotifyRow
          label="Information Regulator notified"
          done={breach.regulatorNotified}
          date={breach.regulatorNotifiedDate}
          onConfirm={() =>
            patch(
              { regulatorNotified: true, regulatorNotifiedDate: todayIso() },
              "Marked the Information Regulator as notified."
            )
          }
          disabled={submitting}
        />
        <NotifyRow
          label="Affected data subjects notified"
          done={breach.dataSubjectsNotified}
          date={breach.dataSubjectsNotifiedDate}
          onConfirm={() =>
            patch(
              { dataSubjectsNotified: true, dataSubjectsNotifiedDate: todayIso() },
              "Marked data subjects as notified."
            )
          }
          disabled={submitting}
        />
      </div>
    </div>
  );
}

function NotifyRow({
  label,
  done,
  date,
  onConfirm,
  disabled,
}: {
  label: string;
  done: boolean;
  date: string | null;
  onConfirm: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] px-3 py-2.5">
      <div>
        <p className="text-sm text-[var(--foreground)]">{label}</p>
        {done && date && <p className="text-xs text-[var(--foreground-muted)]">on {date}</p>}
      </div>
      {done ? (
        <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--status-good-text)]">
          <CheckCircle2 size={14} />
          Done
        </span>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={onConfirm}
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          Mark as notified
        </button>
      )}
    </div>
  );
}
