import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Info,
  AlertOctagon,
  CircleDot,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import type { BadgeTone } from "@/components/Badge";
import type {
  ReviewStatus,
  ChecklistItemStatus,
  FindingStatus,
  BreachSeverity,
  BreachStatus,
} from "@/lib/types";

export interface BadgeSpec {
  tone: BadgeTone;
  label: string;
  icon: LucideIcon;
}

// Operators / processing activities -----------------------------------------

export function reviewStatusBadge(status: ReviewStatus): BadgeSpec {
  switch (status) {
    case "Compliant":
      return { tone: "good", label: "Compliant", icon: CheckCircle2 };
    case "Review Due Soon":
      return { tone: "warning", label: "Review Due Soon", icon: AlertTriangle };
    case "Overdue":
      return { tone: "critical", label: "Overdue", icon: XCircle };
  }
}

// Assessments -----------------------------------------------------------

export function assessmentResultBadge(result: string): BadgeSpec {
  if (result === "Pass") return { tone: "good", label: "Pass", icon: CheckCircle2 };
  return { tone: "critical", label: "Findings Raised", icon: XCircle };
}

export function checklistStatusBadge(status: ChecklistItemStatus): BadgeSpec {
  switch (status) {
    case "Pass":
      return { tone: "good", label: "Pass", icon: CheckCircle2 };
    case "Fail":
      return { tone: "critical", label: "Fail", icon: XCircle };
    case "N/A":
      return { tone: "neutral", label: "N/A", icon: CircleDot };
  }
}

export function findingStatusBadge(status: FindingStatus): BadgeSpec {
  switch (status) {
    case "Open":
      return { tone: "critical", label: "Open", icon: CircleDot };
    case "In Progress":
      return { tone: "warning", label: "In Progress", icon: Loader2 };
    case "Resolved":
      return { tone: "good", label: "Resolved", icon: CheckCircle2 };
  }
}

// Breaches ---------------------------------------------------------------

export function breachSeverityBadge(severity: BreachSeverity): BadgeSpec {
  switch (severity) {
    case "Low":
      return { tone: "info", label: "Low", icon: Info };
    case "Medium":
      return { tone: "warning", label: "Medium", icon: AlertTriangle };
    case "High":
      return { tone: "critical", label: "High", icon: AlertTriangle };
    case "Reportable":
      return { tone: "critical", label: "Reportable", icon: AlertOctagon };
  }
}

export function breachStatusBadge(status: BreachStatus): BadgeSpec {
  switch (status) {
    case "Open":
      return { tone: "critical", label: "Open", icon: CircleDot };
    case "Contained":
      return { tone: "warning", label: "Contained", icon: Clock };
    case "Investigating":
      return { tone: "info", label: "Investigating", icon: Clock };
    case "Closed":
      return { tone: "good", label: "Closed", icon: CheckCircle2 };
  }
}
