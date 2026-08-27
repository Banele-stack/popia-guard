"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, X, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import OperatorsTable from "@/components/operators/OperatorsTable";
import { getOperatorStatus } from "@/lib/status";
import type { Operator, ReviewStatus } from "@/lib/types";

const STATUS_OPTIONS: ReviewStatus[] = ["Compliant", "Review Due Soon", "Overdue"];

export default function OperatorsPageClient({ operators }: { operators: Operator[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "All">("All");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return operators.filter((operator) => {
      if (statusFilter !== "All" && getOperatorStatus(operator) !== statusFilter) return false;
      if (
        query &&
        !operator.name.toLowerCase().includes(query) &&
        !operator.serviceProvided.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [operators, search, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Operators</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            {operators.length} third parties who process personal information on your behalf (POPIA s1).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
        >
          <Plus size={15} />
          Add Operator
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
            placeholder="Search name or service..."
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

        {(search || statusFilter !== "All") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
            }}
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="mb-3 text-xs text-[var(--foreground-muted)]">
        Showing {filtered.length} of {operators.length} operators
      </p>

      <OperatorsTable operators={filtered} />

      {addOpen && (
        <AddOperatorModal
          onClose={() => setAddOpen(false)}
          onAdded={() => {
            setAddOpen(false);
            showToast("Operator added.");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function AddOperatorModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [serviceProvided, setServiceProvided] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [dataShared, setDataShared] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `OP-${Date.now()}`,
          name,
          serviceProvided,
          contactPerson,
          contactEmail,
          contactPhone,
          dataShared,
          onboardedDate: new Date().toISOString().slice(0, 10),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message ?? "Failed to add operator.");
      }
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add operator.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">Add Operator</p>
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

          <Field label="Operator name">
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Service provided">
            <input
              required
              value={serviceProvided}
              onChange={(e) => setServiceProvided(e.target.value)}
              placeholder="e.g. Payroll processing"
              className={inputClass}
            />
          </Field>
          <Field label="Contact person">
            <input required value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact email">
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Contact phone">
              <input required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="What personal information is shared with them">
            <textarea
              required
              value={dataShared}
              onChange={(e) => setDataShared(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add operator"}
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
