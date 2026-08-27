import Link from "next/link";
import {
  Building2,
  ClipboardList,
  ClipboardCheck,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import { getDashboardStats, getNeedsAttentionFeed } from "@/lib/api";

const DOMAIN_ICON: Record<string, LucideIcon> = {
  operator: Building2,
  "processing-activity": ClipboardList,
  assessment: ClipboardCheck,
  breach: AlertTriangle,
};

const DOMAIN_LABEL: Record<string, string> = {
  operator: "Operator",
  "processing-activity": "Processing Activity",
  assessment: "Assessment",
  breach: "Breach",
};

export default async function DashboardPage() {
  const [stats, needsAttentionFeed] = await Promise.all([getDashboardStats(), getNeedsAttentionFeed()]);
  const needsAttention = needsAttentionFeed.slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Compliance Dashboard
        </h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          One view of operator agreements, your Record of Processing Activities, internal
          assessments and the data-breach log.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Operators Overdue"
          value={String(stats.operatorsOverdue)}
          icon={Building2}
          tone={stats.operatorsOverdue > 0 ? "critical" : "good"}
          hint={`${stats.totalOperators} operators tracked`}
          href="/operators"
        />
        <StatCard
          label="Activity Reviews Overdue"
          value={String(stats.activitiesOverdue)}
          icon={ClipboardList}
          tone={stats.activitiesOverdue > 0 ? "critical" : "good"}
          hint={`${stats.totalProcessingActivities} entries in your ROPA`}
          href="/processing-activities"
        />
        <StatCard
          label="Open Findings"
          value={String(stats.openFindings)}
          icon={ClipboardCheck}
          tone={stats.openFindings > 0 ? "warning" : "good"}
          hint="From internal self-assessments"
          href="/assessments"
        />
        <StatCard
          label="Breaches Unreported"
          value={String(stats.breachesUnreported)}
          icon={AlertTriangle}
          tone={stats.breachesUnreported > 0 ? "critical" : "good"}
          hint={`${stats.breachesOpen} open · ${stats.breachesThisMonth} this month`}
          href="/breaches"
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
            <ShieldAlert size={17} className="text-[var(--accent)]" />
            Needs Attention
          </h2>
          <p className="text-xs text-[var(--foreground-muted)]">
            Ranked across operators, processing activities, assessments and breaches — most urgent first.
          </p>
        </div>

        {needsAttention.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-10 text-center text-sm text-[var(--foreground-muted)]">
            Nothing needs attention right now — everything is in good standing.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {needsAttention.map((item) => {
              const Icon = DOMAIN_ICON[item.domain];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-muted)]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--foreground-muted)]">
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                    <p className="truncate text-xs text-[var(--foreground-muted)]">{item.subtitle}</p>
                  </div>
                  <Badge tone={item.tone} label={DOMAIN_LABEL[item.domain]} size="sm" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/operators"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--border-strong)]"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Building2 size={18} />
            </span>
            <ArrowRight size={15} className="text-[var(--foreground-muted)]" />
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">Operators</p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            {stats.totalOperators} third parties · {stats.operatorsDueSoon} agreements due soon
          </p>
        </Link>

        <Link
          href="/processing-activities"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--border-strong)]"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <ClipboardList size={18} />
            </span>
            <ArrowRight size={15} className="text-[var(--foreground-muted)]" />
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">Processing Activities</p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            {stats.totalProcessingActivities} entries · {stats.activitiesDueSoon} reviews due soon
          </p>
        </Link>

        <Link
          href="/breaches"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--border-strong)]"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <AlertTriangle size={18} />
            </span>
            <ArrowRight size={15} className="text-[var(--foreground-muted)]" />
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">Breaches</p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            {stats.breachesOpen} open · {stats.breachesUnreported} not yet reported to the Regulator
          </p>
        </Link>
      </div>
    </div>
  );
}
