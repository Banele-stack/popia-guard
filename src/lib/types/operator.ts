export type ReviewStatus = "Compliant" | "Review Due Soon" | "Overdue";

export interface OperatorAgreement {
  id: string;
  operatorId: string;
  type: string;
  signedDate: string; // ISO date
  reviewDate: string; // ISO date
  referenceNumber: string;
  fileUrl: string | null;
  fileOriginalName: string | null;
  fileMimeType: string | null;
  fileSizeBytes: number | null;
}

export interface Operator {
  id: string;
  name: string;
  serviceProvided: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  dataShared: string;
  onboardedDate: string; // ISO date
  agreements: OperatorAgreement[];
}
