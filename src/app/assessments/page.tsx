import Link from "next/link";
import { Plus, ArrowRight, ClipboardCheck } from "lucide-react";
import { getAssessments } from "@/lib/api";
import { assessmentResultBadge } from "@/lib/badges";
import { formatDate } from "@/lib/utils";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";

export default async function AssessmentsPage() {
  const assessments = await getAssessments();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Assessments</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            {assessments.length} internal POPIA self-assessments. A failed checklist item automatically
            raises an open finding.
          </p>
        </div>
        <Link
          href="/assessments/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
        >
          <Plus size={15} />
          New Assessment
        </Link>
      </div>

      {assessments.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No assessments yet"
          description="Run your first internal POPIA self-assessment to see how you stack up."
        />
      ) : (
        <div className="scroll-x rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
                <th className="px-4 py-3 font-medium">Assessment</th>
                <th className="px-4 py-3 font-medium">Area</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Findings</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => {
                const badge = assessmentResultBadge(assessment.result);
                const openFindings = assessment.findings.filter((f) => f.status !== "Resolved").length;
                return (
                  <tr
                    key={assessment.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/assessments/${assessment.id}`}
                        className="font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                      >
                        {assessment.title}
                      </Link>
                      <p className="text-xs text-[var(--foreground-muted)]">{assessment.assessorName}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)]">{assessment.area}</td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)]">{formatDate(assessment.date)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={badge.tone} label={badge.label} icon={badge.icon} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)]">
                      {openFindings > 0 ? `${openFindings} open` : "None"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/assessments/${assessment.id}`}
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
    </div>
  );
}
