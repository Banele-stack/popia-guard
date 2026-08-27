import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import type { Operator } from "@/lib/types";
import { getOperatorStatus } from "@/lib/status";
import { reviewStatusBadge } from "@/lib/badges";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";

export default function OperatorsTable({ operators }: { operators: Operator[] }) {
  if (operators.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No operators match these filters"
        description="Try adjusting the search term above, or add a new operator."
      />
    );
  }

  return (
    <div className="scroll-x rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
            <th className="px-4 py-3 font-medium">Operator</th>
            <th className="px-4 py-3 font-medium">Service Provided</th>
            <th className="px-4 py-3 font-medium">Agreements</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {operators.map((operator) => {
            const status = getOperatorStatus(operator);
            const badge = reviewStatusBadge(status);
            return (
              <tr
                key={operator.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)]"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/operators/${operator.id}`}
                    className="font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                  >
                    {operator.name}
                  </Link>
                  <p className="text-xs text-[var(--foreground-muted)]">{operator.contactPerson}</p>
                </td>
                <td className="px-4 py-3 text-[var(--foreground-muted)]">{operator.serviceProvided}</td>
                <td className="px-4 py-3 text-[var(--foreground-muted)]">{operator.agreements.length}</td>
                <td className="px-4 py-3">
                  <Badge tone={badge.tone} label={badge.label} icon={badge.icon} size="sm" />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/operators/${operator.id}`}
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
