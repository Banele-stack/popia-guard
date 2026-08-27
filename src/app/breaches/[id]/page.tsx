import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle, CalendarDays, Users } from "lucide-react";
import { getBreachById } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { breachSeverityBadge, breachStatusBadge } from "@/lib/badges";
import Badge from "@/components/Badge";
import BreachActionsPanel from "@/components/breaches/BreachActionsPanel";

export default async function BreachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const breach = await getBreachById(id);
  if (!breach) notFound();

  const sBadge = breachSeverityBadge(breach.severity);
  const stBadge = breachStatusBadge(breach.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/breaches"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
      >
        <ArrowLeft size={15} />
        Back to breaches
      </Link>

      <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <AlertTriangle size={26} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
                {breach.title}
              </h1>
              <Badge tone={sBadge.tone} label={sBadge.label} icon={sBadge.icon} />
              <Badge tone={stBadge.tone} label={stBadge.label} icon={stBadge.icon} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--foreground-muted)]">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} />
                Discovered {formatDate(breach.dateDiscovered)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                {breach.numberOfDataSubjectsAffected} data subject(s) affected
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">What happened</h2>
            <p className="text-sm text-[var(--foreground-muted)]">{breach.description}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Data affected</h2>
            <p className="text-sm text-[var(--foreground-muted)]">{breach.categoryOfDataAffected}</p>
          </div>
          {breach.rootCause && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Root cause</h2>
              <p className="text-sm text-[var(--foreground-muted)]">{breach.rootCause}</p>
            </div>
          )}
          {breach.correctiveActions.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Corrective actions</h2>
              <ul className="space-y-2">
                {breach.correctiveActions.map((action) => (
                  <li key={action.id} className="text-sm text-[var(--foreground-muted)]">
                    <span className={action.done ? "line-through" : ""}>{action.description}</span>{" "}
                    <span className="text-xs">
                      ({action.owner}, due {formatDate(action.dueDate)})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <BreachActionsPanel breach={breach} />
      </div>
    </div>
  );
}
