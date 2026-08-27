"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import type { Organization } from "@/lib/types";

export default function SettingsPageClient({
  organization,
  isAdmin,
}: {
  organization: Organization;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [informationOfficerName, setInformationOfficerName] = useState(organization.informationOfficerName ?? "");
  const [informationOfficerEmail, setInformationOfficerEmail] = useState(organization.informationOfficerEmail ?? "");
  const [regulatorRegistrationRef, setRegulatorRegistrationRef] = useState(organization.regulatorRegistrationRef ?? "");
  const [regulatorRegistrationDate, setRegulatorRegistrationDate] = useState(
    organization.regulatorRegistrationDate ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/organizations/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          informationOfficerName,
          informationOfficerEmail,
          regulatorRegistrationRef,
          regulatorRegistrationDate,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message ?? "Failed to save settings.");
      }
      showToast("Settings saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Your organization&apos;s Information Officer and Information Regulator registration details.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <ShieldCheck size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Information Officer</p>
            <p className="text-xs text-[var(--foreground-muted)]">
              POPIA requires every organization to appoint and register one.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Field label="Information Officer name">
            <input
              value={informationOfficerName}
              onChange={(e) => setInformationOfficerName(e.target.value)}
              disabled={!isAdmin}
              className={inputClass}
            />
          </Field>

          <Field label="Information Officer email">
            <input
              type="email"
              value={informationOfficerEmail}
              onChange={(e) => setInformationOfficerEmail(e.target.value)}
              disabled={!isAdmin}
              className={inputClass}
            />
          </Field>

          <Field label="Information Regulator registration reference">
            <input
              value={regulatorRegistrationRef}
              onChange={(e) => setRegulatorRegistrationRef(e.target.value)}
              disabled={!isAdmin}
              placeholder="e.g. IR-2024-004821"
              className={inputClass}
            />
          </Field>

          <Field label="Registration date">
            <input
              type="date"
              value={regulatorRegistrationDate}
              onChange={(e) => setRegulatorRegistrationDate(e.target.value)}
              disabled={!isAdmin}
              className={inputClass}
            />
          </Field>

          {isAdmin ? (
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save settings"}
            </button>
          ) : (
            <p className="text-xs text-[var(--foreground-muted)]">
              Only an admin on your organization can change these settings.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</label>
      {children}
    </div>
  );
}
