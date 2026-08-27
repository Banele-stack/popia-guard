"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  X,
  Download,
  Hash,
  CalendarClock,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  FileX,
} from "lucide-react";
import type { OperatorAgreement } from "@/lib/types";
import { getReviewStatus } from "@/lib/status";
import { formatDate, formatDaysRemaining, daysUntil } from "@/lib/utils";
import { reviewStatusBadge } from "@/lib/badges";
import Badge from "@/components/Badge";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = "application/pdf,image/jpeg,image/png";
const AGREEMENT_TYPES = ["Operator Agreement (s21)", "Data Processing Addendum", "Non-Disclosure Agreement"];

export default function AgreementsChecklist({
  operatorId,
  agreements,
}: {
  operatorId: string;
  agreements: OperatorAgreement[];
}) {
  const router = useRouter();
  const [active, setActive] = useState<OperatorAgreement | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const sorted = [...agreements].sort((a, b) => daysUntil(a.reviewDate) - daysUntil(b.reviewDate));

  return (
    <>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
        >
          <Plus size={14} />
          Add Agreement
        </button>
      </div>

      <div className="scroll-x rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[700px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
              <th className="px-4 py-3 font-medium">Agreement</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Signed</th>
              <th className="px-4 py-3 font-medium">Review Due</th>
              <th className="px-4 py-3 font-medium">Remaining</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--foreground-muted)]">
                  No agreement on file yet — POPIA s21 requires one before sharing data with this operator.
                </td>
              </tr>
            )}
            {sorted.map((agreement) => {
              const days = daysUntil(agreement.reviewDate);
              const badge = reviewStatusBadge(getReviewStatus(agreement.reviewDate));
              return (
                <tr
                  key={agreement.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--foreground)]">{agreement.type}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">Ref. {agreement.referenceNumber}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={badge.tone} label={badge.label} icon={badge.icon} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground-muted)]">{formatDate(agreement.signedDate)}</td>
                  <td className="px-4 py-3 text-[var(--foreground-muted)]">{formatDate(agreement.reviewDate)}</td>
                  <td className="px-4 py-3">
                    <span
                      style={{
                        color:
                          days < 0
                            ? "var(--status-critical-text)"
                            : days <= 30
                            ? "var(--status-warning-text)"
                            : "var(--foreground-muted)",
                      }}
                    >
                      {formatDaysRemaining(days)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setActive(agreement)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                    >
                      <FileText size={13} />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {active && (
        <AgreementDetailModal
          agreement={active}
          operatorId={operatorId}
          onClose={() => setActive(null)}
          onDeleted={() => {
            setActive(null);
            router.refresh();
          }}
        />
      )}

      {addOpen && (
        <AddAgreementModal
          operatorId={operatorId}
          onClose={() => setAddOpen(false)}
          onAdded={() => {
            setAddOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function AgreementDetailModal({
  agreement,
  operatorId,
  onClose,
  onDeleted,
}: {
  agreement: OperatorAgreement;
  operatorId: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileHref = `/api/operators/${operatorId}/agreements/${agreement.id}/file`;

  async function handleDelete() {
    if (!confirm(`Remove "${agreement.type}" from this operator's file? This can't be undone.`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/operators/${operatorId}/agreements/${agreement.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to delete agreement.");
      }
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete agreement.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <FileText size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{agreement.type}</p>
              <p className="text-xs text-[var(--foreground-muted)]">
                {agreement.fileOriginalName ? agreement.fileOriginalName : "No file attached"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <dl className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2">
            <Hash size={14} className="shrink-0 text-[var(--foreground-muted)]" />
            <dt className="text-[var(--foreground-muted)]">Reference</dt>
            <dd className="ml-auto font-medium text-[var(--foreground)]">{agreement.referenceNumber}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock size={14} className="shrink-0 text-[var(--foreground-muted)]" />
            <dt className="text-[var(--foreground-muted)]">Signed &ndash; Review due</dt>
            <dd className="ml-auto font-medium text-[var(--foreground)]">
              {formatDate(agreement.signedDate)} &ndash; {formatDate(agreement.reviewDate)}
            </dd>
          </div>
        </dl>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!agreement.fileUrl ? (
          <div className="mt-5 flex items-center justify-between rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] px-4 py-6 text-center">
            <p className="flex w-full items-center justify-center gap-1.5 text-xs text-[var(--foreground-muted)]">
              <FileX size={14} />
              No file was uploaded for this agreement.
            </p>
          </div>
        ) : (
          <a
            href={fileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
          >
            <Download size={14} />
            View / Download File
          </a>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:hover:bg-red-950"
        >
          <Trash2 size={14} />
          {deleting ? "Removing…" : "Remove agreement"}
        </button>
      </div>
    </div>
  );
}

function AddAgreementModal({
  operatorId,
  onClose,
  onAdded,
}: {
  operatorId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState(AGREEMENT_TYPES[0]);
  const [signedDate, setSignedDate] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) {
      setFileName(null);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("File is larger than 10MB.");
      e.target.value = "";
      setFileName(null);
      return;
    }
    setFileName(file.name);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please attach the signed agreement (PDF, JPEG or PNG).");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.set("type", type);
    formData.set("signedDate", signedDate);
    formData.set("reviewDate", reviewDate);
    formData.set("referenceNumber", referenceNumber);
    formData.set("file", file);

    try {
      const res = await fetch(`/api/operators/${operatorId}/agreements`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
        throw new Error(message ?? "Failed to upload agreement.");
      }
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload agreement.");
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
          <p className="text-sm font-semibold text-[var(--foreground)]">Add Operator Agreement</p>
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

          <div>
            <label htmlFor="ag-type" className="mb-1 block text-xs font-medium text-[var(--foreground)]">
              Agreement type
            </label>
            <select
              id="ag-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              {AGREEMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="signed-date" className="mb-1 block text-xs font-medium text-[var(--foreground)]">
                Signed date
              </label>
              <input
                id="signed-date"
                type="date"
                required
                value={signedDate}
                onChange={(e) => setSignedDate(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label htmlFor="review-date" className="mb-1 block text-xs font-medium text-[var(--foreground)]">
                Review due date
              </label>
              <input
                id="review-date"
                type="date"
                required
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ref-number" className="mb-1 block text-xs font-medium text-[var(--foreground)]">
              Reference number
            </label>
            <input
              id="ref-number"
              type="text"
              required
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-[var(--foreground)]">
              Signed agreement file (PDF, JPEG or PNG, max 10MB)
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-[var(--border)] px-4 py-4 text-xs text-[var(--foreground-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Upload size={14} />
              {fileName ?? "Choose a file"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {submitting ? "Uploading…" : "Add agreement"}
          </button>
        </div>
      </form>
    </div>
  );
}
