import { daysUntil } from "@/lib/utils";
import type { Operator, ProcessingActivity, ReviewStatus } from "@/lib/types";

export const REVIEW_DUE_SOON_DAYS = 30;

export function getStatusForDays(daysRemaining: number): ReviewStatus {
  if (daysRemaining < 0) return "Overdue";
  if (daysRemaining <= REVIEW_DUE_SOON_DAYS) return "Review Due Soon";
  return "Compliant";
}

export function getReviewStatus(reviewDate: string): ReviewStatus {
  return getStatusForDays(daysUntil(reviewDate));
}

/** An operator with no agreement on file at all is treated as worse than "overdue". */
export function getOperatorStatus(operator: Operator): ReviewStatus {
  if (operator.agreements.length === 0) return "Overdue";
  const statuses = operator.agreements.map((a) => getReviewStatus(a.reviewDate));
  if (statuses.includes("Overdue")) return "Overdue";
  if (statuses.includes("Review Due Soon")) return "Review Due Soon";
  return "Compliant";
}

export function getActivityStatus(activity: ProcessingActivity): ReviewStatus {
  return getReviewStatus(activity.reviewDate);
}
