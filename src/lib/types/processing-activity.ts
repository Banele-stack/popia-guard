export type LegalBasis =
  | "Consent"
  | "Contract"
  | "Legal Obligation"
  | "Legitimate Interest"
  | "Vital Interest"
  | "Public Law Duty";

export const LEGAL_BASES: LegalBasis[] = [
  "Consent",
  "Contract",
  "Legal Obligation",
  "Legitimate Interest",
  "Vital Interest",
  "Public Law Duty",
];

export type DataSubjectCategory = "Employees" | "Customers" | "Job Applicants" | "Suppliers" | "Website Visitors";

export const DATA_SUBJECT_CATEGORIES: DataSubjectCategory[] = [
  "Employees",
  "Customers",
  "Job Applicants",
  "Suppliers",
  "Website Visitors",
];

export interface ProcessingActivity {
  id: string;
  activityName: string;
  department: string;
  categoryOfDataSubjects: DataSubjectCategory;
  personalInfoCollected: string;
  specialPersonalInfo: boolean;
  purposeOfProcessing: string;
  legalBasis: LegalBasis;
  retentionPeriod: string;
  reviewDate: string; // ISO date
}
