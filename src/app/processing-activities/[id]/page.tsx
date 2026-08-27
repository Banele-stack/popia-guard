import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, Building2, Users, ShieldAlert, Scale, CalendarClock, Archive } from "lucide-react";
import { getProcessingActivityById } from "@/lib/api";
import { getActivityStatus } from "@/lib/status";
import { formatDate } from "@/lib/utils";
import { reviewStatusBadge } from "@/lib/badges";
import Badge from "@/components/Badge";

export default async function ProcessingActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getProcessingActivityById(id);
  if (!activity) notFound();

  const status = getActivityStatus(activity);
  const badge = reviewStatusBadge(status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/processing-activities"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
      >
        <ArrowLeft size={15} />
        Back to processing activities
      </Link>

      <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <ClipboardList size={26} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
                {activity.activityName}
              </h1>
              <Badge tone={badge.tone} label={badge.label} icon={badge.icon} />
              {activity.specialPersonalInfo && (
                <Badge tone="warning" label="Special personal information" icon={ShieldAlert} size="sm" />
              )}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)]">
              <Building2 size={14} />
              {activity.department}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)]">
            <Users size={13} /> Category of Data Subjects
          </p>
          <p className="mt-1.5 text-sm font-semibold text-[var(--foreground)]">{activity.categoryOfDataSubjects}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)]">
            <Scale size={13} /> Legal Basis (POPIA s11)
          </p>
          <p className="mt-1.5 text-sm font-semibold text-[var(--foreground)]">{activity.legalBasis}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)]">
            <CalendarClock size={13} /> Next Review Due
          </p>
          <p className="mt-1.5 text-sm font-semibold text-[var(--foreground)]">{formatDate(activity.reviewDate)}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)]">
            <Archive size={13} /> Retention Period
          </p>
          <p className="mt-1.5 text-sm font-semibold text-[var(--foreground)]">{activity.retentionPeriod}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Personal Information Collected</h2>
          <p className="text-sm text-[var(--foreground-muted)]">{activity.personalInfoCollected}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Purpose of Processing</h2>
          <p className="text-sm text-[var(--foreground-muted)]">{activity.purposeOfProcessing}</p>
        </div>
      </div>
    </div>
  );
}
