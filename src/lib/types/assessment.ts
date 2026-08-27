export type ChecklistItemStatus = "Pass" | "Fail" | "N/A";
export type FindingStatus = "Open" | "In Progress" | "Resolved";
export type AssessmentResult = "Pass" | "Findings Raised";

export interface ChecklistItem {
  id: string;
  label: string;
  status: ChecklistItemStatus;
  note?: string;
}

export interface Finding {
  id: string;
  checklistItemLabel: string;
  description: string;
  status: FindingStatus;
  raisedBy: string;
  raisedDate: string; // ISO date
}

export interface Assessment {
  id: string;
  title: string;
  assessorName: string;
  date: string; // ISO date
  area: string;
  result: string;
  notes: string;
  checklist: ChecklistItem[];
  findings: Finding[];
}
