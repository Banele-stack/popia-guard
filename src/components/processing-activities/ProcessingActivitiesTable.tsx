import Link from "next/link";
import { ArrowRight, ClipboardList, ShieldAlert } from "lucide-react";
import type { ProcessingActivity } from "@/lib/types";
import { getActivityStatus } from "@/lib/status";
import { formatDaysRemaining, daysUntil } from "@/lib/utils";
import { reviewStatusBadge } from "@/lib/badges";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";

export default function ProcessingActivitiesTable({ activities }: { activities: ProcessingActivity[] }) {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No processing activities match these filters"
        description="Try adjusting the filters above, or add a new entry to your ROPA."
      />
    );
  }

  return (
    <div className="scroll-x rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
            <th className="px-4 py-3 font-medium">Activity</th>
            <th className="px-4 py-3 font-medium">Data Subjects</th>
            <th className="px-4 py-3 font-medium">Legal Basis</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Review</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => {
            const days = daysUntil(activity.reviewDate);
            const badge = reviewStatusBadge(getActivityStatus(activity));
            return (
              <tr
                key={activity.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)]"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/processing-activities/${activity.id}`}
                    className="font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                  >
                    {activity.activityName}
                  </Link>
                  <p className="flex items-center gap-1 text-xs text-[var(--foreground-muted)]">
                    {activity.department}
                    {activity.specialPersonalInfo && (
                      <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                        <ShieldAlert size={11} /> special
                      </span>
                    )}
                  </p>
                </td>
                <td className="px-4 py-3 text-[var(--foreground-muted)]">{activity.categoryOfDataSubjects}</td>
                <td className="px-4 py-3 text-[var(--foreground-muted)]">{activity.legalBasis}</td>
                <td className="px-4 py-3">
                  <Badge tone={badge.tone} label={badge.label} icon={badge.icon} size="sm" />
                </td>
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
                  <Link
                    href={`/processing-activities/${activity.id}`}
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
  );
}
