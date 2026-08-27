import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Mail, Phone, User, CalendarDays, FileStack, Database } from "lucide-react";
import { getOperatorById } from "@/lib/api";
import { getOperatorStatus } from "@/lib/status";
import { formatDate } from "@/lib/utils";
import { reviewStatusBadge } from "@/lib/badges";
import Badge from "@/components/Badge";
import AgreementsChecklist from "@/components/operators/AgreementsChecklist";

export default async function OperatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const operator = await getOperatorById(id);
  if (!operator) notFound();

  const status = getOperatorStatus(operator);
  const badge = reviewStatusBadge(status);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/operators"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
      >
        <ArrowLeft size={15} />
        Back to operators
      </Link>

      <div className="mt-4 flex flex-col gap-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Building2 size={26} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
                {operator.name}
              </h1>
              <Badge tone={badge.tone} label={badge.label} icon={badge.icon} />
            </div>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">{operator.serviceProvided}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--foreground-muted)]">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {operator.contactPerson}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={14} />
                {operator.contactPhone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={14} />
                {operator.contactEmail}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)]">
            <CalendarDays size={13} /> Onboarded
          </p>
          <p className="mt-1.5 text-lg font-semibold text-[var(--foreground)]">
            {formatDate(operator.onboardedDate)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)]">
            <FileStack size={13} /> Agreements on File
          </p>
          <p className="mt-1.5 text-lg font-semibold text-[var(--foreground)]">{operator.agreements.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:col-span-1 col-span-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)]">
            <Database size={13} /> Data Shared
          </p>
          <p className="mt-1.5 text-sm text-[var(--foreground)]">{operator.dataShared}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-[var(--foreground)]">
          Operator Agreements (POPIA s21)
        </h2>
        <AgreementsChecklist operatorId={operator.id} agreements={operator.agreements} />
      </div>
    </div>
  );
}
