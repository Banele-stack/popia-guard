import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardCheck, User, CalendarDays, Building2 } from "lucide-react";
import { getAssessmentById } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { assessmentResultBadge, checklistStatusBadge, findingStatusBadge } from "@/lib/badges";
import Badge from "@/components/Badge";

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = await getAssessmentById(id);
  if (!assessment) notFound();

  const badge = assessmentResultBadge(assessment.result);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/assessments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
      >
        <ArrowLeft size={15} />
        Back to assessments
      </Link>

      <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <ClipboardCheck size={26} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
                {assessment.title}
              </h1>
              <Badge tone={badge.tone} label={badge.label} icon={badge.icon} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--foreground-muted)]">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {assessment.assessorName}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} />
                {formatDate(assessment.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 size={14} />
                {assessment.area}
              </span>
            </div>
          </div>
        </div>
        {assessment.notes && <p className="text-sm text-[var(--foreground-muted)]">{assessment.notes}</p>}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-[var(--foreground)]">Checklist</h2>
        <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {assessment.checklist.map((item) => {
            const cBadge = checklistStatusBadge(item.status);
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                  {item.note && <p className="text-xs text-[var(--foreground-muted)]">{item.note}</p>}
                </div>
                <Badge tone={cBadge.tone} label={cBadge.label} icon={cBadge.icon} size="sm" />
              </div>
            );
          })}
        </div>
      </div>

      {assessment.findings.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-base font-semibold text-[var(--foreground)]">Findings</h2>
          <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {assessment.findings.map((finding) => {
              const fBadge = findingStatusBadge(finding.status);
              return (
                <div key={finding.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{finding.checklistItemLabel}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">{finding.description}</p>
                    <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                      Raised by {finding.raisedBy} on {formatDate(finding.raisedDate)}
                    </p>
                  </div>
                  <Badge tone={fBadge.tone} label={fBadge.label} icon={fBadge.icon} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
