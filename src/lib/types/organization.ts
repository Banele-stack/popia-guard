export interface Organization {
  id: string;
  name: string;
  informationOfficerName: string | null;
  informationOfficerEmail: string | null;
  regulatorRegistrationRef: string | null;
  regulatorRegistrationDate: string | null;
  createdAt: string; // ISO datetime
}
