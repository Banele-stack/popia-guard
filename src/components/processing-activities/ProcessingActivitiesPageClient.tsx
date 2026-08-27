"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, X, AlertCircle } from "lucide-react";
import ProcessingActivitiesTable from "@/components/processing-activities/ProcessingActivitiesTable";
import { getActivityStatus } from "@/lib/status";
import { DATA_SUBJECT_CATEGORIES, LEGAL_BASES } from "@/lib/types";
import type { ProcessingActivity, ReviewStatus, DataSubjectCategory, LegalBasis } from "@/lib/types";

const STATUS_OPTIONS: ReviewStatus[] = ["Compliant", "Review Due Soon", "Overdue"];

export default function ProcessingActivitiesPageClient({ activities }: { activities: ProcessingActivity[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<DataSubjectCategory | "All">("All");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activities.filter((activity) => {
      if (statusFilter !== "All" && getActivityStatus(activity) !== statusFilter) return false;
      if (categoryFilter !== "All" && activity.categoryOfDataSubjects !== categoryFilter) return false;
      if (query && !activity.activityName.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [activities, search, statusFilter, categoryFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Record of Processing Activities
          </h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            {activities.length} entries — what personal information you process, why, and on what legal
            basis. The document the Information Regulator can request at any time.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
        >
          <Plus size={15} />
          Add Activity
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[220px] sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity name..."
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | "All")}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option value="All">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as DataSubjectCategory | "All")}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option value="All">All data subjects</option>
          {DATA_SUBJECT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {(search || statusFilter !== "All" || categoryFilter !== "All") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setCategoryFilter("All");
            }}
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="mb-3 text-xs text-[var(--foreground-muted)]">
        Showing {filtered.length} of {activities.length} activities
      </p>

      <ProcessingActivitiesTable activities={filtered} />

      {addOpen && (
        <AddActivityModal
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

function AddActivityModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [activityName, setActivityName] = useState("");
  const [department, setDepartment] = useState("");
  const [categoryOfDataSubjects, setCategoryOfDataSubjects] = useState<DataSubjectCategory>(
    DATA_SUBJECT_CATEGORIES[0]
  );
  const [personalInfoCollected, setPersonalInfoCollected] = useState("");
  const [specialPersonalInfo, setSpecialPersonalInfo] = useState(false);
  const [purposeOfProcessing, setPurposeOfProcessing] = useState("");
  const [legalBasis, setLegalBasis] = useState<LegalBasis>(LEGAL_BASES[0]);
  const [retentionPeriod, setRetentionPeriod] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/processing-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `PA-${Date.now()}`,
          activityName,
          department,
          categoryOfDataSubjects,
          personalInfoCollected,
          specialPersonalInfo,
          purposeOfProcessing,
          legalBasis,
          retentionPeriod,
          reviewDate,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
        throw new Error(message ?? "Failed to add activity.");
      }
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add activity.");
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
          <p className="text-sm font-semibold text-[var(--foreground)]">Add Processing Activity</p>
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

          <Field label="Activity name">
            <input
              required
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="e.g. Employee payroll processing"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Department">
              <input required value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Category of data subjects">
              <select
                value={categoryOfDataSubjects}
                onChange={(e) => setCategoryOfDataSubjects(e.target.value as DataSubjectCategory)}
                className={inputClass}
              >
                {DATA_SUBJECT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Personal information collected">
            <textarea
              required
              rows={2}
              value={personalInfoCollected}
              onChange={(e) => setPersonalInfoCollected(e.target.value)}
              className={inputClass}
            />
          </Field>

          <label className="flex items-center gap-2 text-xs text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={specialPersonalInfo}
              onChange={(e) => setSpecialPersonalInfo(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            Includes special personal information (health, biometric, religious/political belief, criminal
            record — POPIA s26)
          </label>

          <Field label="Purpose of processing">
            <textarea
              required
              rows={2}
              value={purposeOfProcessing}
              onChange={(e) => setPurposeOfProcessing(e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Legal basis (POPIA s11)">
              <select value={legalBasis} onChange={(e) => setLegalBasis(e.target.value as LegalBasis)} className={inputClass}>
                {LEGAL_BASES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Review due date">
              <input
                type="date"
                required
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Retention period">
            <input
              required
              value={retentionPeriod}
              onChange={(e) => setRetentionPeriod(e.target.value)}
              placeholder="e.g. 5 years after employment ends"
              className={inputClass}
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add activity"}
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
