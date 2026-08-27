export type BreachSeverity = "Low" | "Medium" | "High" | "Reportable";
export type BreachStatus = "Open" | "Contained" | "Investigating" | "Closed";

export const BREACH_SEVERITIES: BreachSeverity[] = ["Low", "Medium", "High", "Reportable"];

export interface CorrectiveAction {
  id: string;
  description: string;
  owner: string;
  dueDate: string; // ISO date
  done: boolean;
}

export interface Breach {
  id: string;
  title: string;
  severity: BreachSeverity;
  status: BreachStatus;
  dateDiscovered: string; // ISO date
  dateOccurred: string | null;
  description: string;
  categoryOfDataAffected: string;
  numberOfDataSubjectsAffected: number;
  rootCause: string | null;
  correctiveActions: CorrectiveAction[];
  regulatorNotified: boolean;
  regulatorNotifiedDate: string | null;
  dataSubjectsNotified: boolean;
  dataSubjectsNotifiedDate: string | null;
}
