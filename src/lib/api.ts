/**
 * Fetch client for the POPIAGuard NestJS + TypeORM backend
 * (popia-guard-api, default http://localhost:4011). `cache()` dedupes
 * repeated calls within a single server render pass; `cache: "no-store"`
 * on the underlying fetch keeps every request talking to the live database
 * instead of Next's default fetch cache, since this data changes at runtime.
 */
import { cache } from "react";
import { redirect } from "next/navigation";
import type {
  Operator,
  ProcessingActivity,
  Assessment,
  Breach,
  OrgMember,
  Organization,
  ChecklistItemStatus,
} from "@/lib/types";
import type { BadgeTone } from "@/components/Badge";
import { getSessionToken } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4011";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: string
  ) {
    super(message);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getSessionToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(
      0,
      `Could not reach the POPIAGuard API at ${API_URL}. Is popia-guard-api running?`
    );
  }
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, `${init?.method ?? "GET"} ${path} failed (${res.status}): ${body}`, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;
  try {
    const message = JSON.parse(err.body || "{}").message;
    return Array.isArray(message) ? message.join(" ") : (message ?? fallback);
  } catch {
    return fallback;
  }
}

export function apiErrorStatus(err: unknown, fallback = 502): number {
  return err instanceof ApiError && err.status ? err.status : fallback;
}

async function apiFetchOrUndefined<T>(path: string): Promise<T | undefined> {
  try {
    return await apiFetch<T>(path);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Organization (Information Officer / Regulator registration)
// ---------------------------------------------------------------------------

export const getOwnOrganization = cache((): Promise<Organization> => apiFetch("/organizations/me"));

export interface UpdateOrganizationInput {
  informationOfficerName?: string;
  informationOfficerEmail?: string;
  regulatorRegistrationRef?: string;
  regulatorRegistrationDate?: string;
}

export function updateOwnOrganization(input: UpdateOrganizationInput): Promise<Organization> {
  return apiFetch("/organizations/me", { method: "PATCH", body: JSON.stringify(input) });
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export const getMembers = cache((): Promise<OrgMember[]> => apiFetch("/organizations/members"));

export interface InviteMemberInput {
  name: string;
  email: string;
  role?: "admin" | "member";
}

export function inviteMember(input: InviteMemberInput): Promise<OrgMember> {
  return apiFetch("/organizations/members", { method: "POST", body: JSON.stringify(input) });
}

export function removeMember(id: string): Promise<{ message: string }> {
  return apiFetch(`/organizations/members/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Operators
// ---------------------------------------------------------------------------

export const getOperators = cache((): Promise<Operator[]> => apiFetch("/operators"));

export const getOperatorById = cache(
  (id: string): Promise<Operator | undefined> => apiFetchOrUndefined(`/operators/${id}`)
);

export interface CreateOperatorInput {
  id: string;
  name: string;
  serviceProvided: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  dataShared: string;
  onboardedDate: string;
}

export function createOperator(input: CreateOperatorInput): Promise<Operator> {
  return apiFetch("/operators", { method: "POST", body: JSON.stringify(input) });
}

// ---------------------------------------------------------------------------
// Processing activities
// ---------------------------------------------------------------------------

export const getProcessingActivities = cache(
  (): Promise<ProcessingActivity[]> => apiFetch("/processing-activities")
);

export const getProcessingActivityById = cache(
  (id: string): Promise<ProcessingActivity | undefined> =>
    apiFetchOrUndefined(`/processing-activities/${id}`)
);

export type CreateProcessingActivityInput = Omit<ProcessingActivity, never>;

export function createProcessingActivity(input: CreateProcessingActivityInput): Promise<ProcessingActivity> {
  return apiFetch("/processing-activities", { method: "POST", body: JSON.stringify(input) });
}

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export const getAssessments = cache((): Promise<Assessment[]> => apiFetch("/assessments"));

export const getAssessmentById = cache(
  (id: string): Promise<Assessment | undefined> => apiFetchOrUndefined(`/assessments/${id}`)
);

export interface CreateAssessmentInput {
  title: string;
  assessorName: string;
  date: string;
  area: string;
  notes?: string;
  checklist: { id: string; label: string; status: ChecklistItemStatus; note?: string }[];
}

export function createAssessment(input: CreateAssessmentInput): Promise<Assessment> {
  return apiFetch("/assessments", { method: "POST", body: JSON.stringify(input) });
}

// ---------------------------------------------------------------------------
// Breaches
// ---------------------------------------------------------------------------

export const getBreaches = cache((): Promise<Breach[]> => apiFetch("/breaches"));

export const getBreachById = cache(
  (id: string): Promise<Breach | undefined> => apiFetchOrUndefined(`/breaches/${id}`)
);

export interface CreateBreachInput {
  title: string;
  severity: string;
  dateDiscovered: string;
  dateOccurred?: string;
  description: string;
  categoryOfDataAffected: string;
  numberOfDataSubjectsAffected: number;
  regulatorNotified?: boolean;
  dataSubjectsNotified?: boolean;
}

export function createBreach(input: CreateBreachInput): Promise<Breach> {
  return apiFetch("/breaches", { method: "POST", body: JSON.stringify(input) });
}

export interface UpdateBreachInput {
  status?: string;
  rootCause?: string;
  regulatorNotified?: boolean;
  regulatorNotifiedDate?: string;
  dataSubjectsNotified?: boolean;
  dataSubjectsNotifiedDate?: string;
}

export function updateBreach(id: string, input: UpdateBreachInput): Promise<Breach> {
  return apiFetch(`/breaches/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalOperators: number;
  operatorsOverdue: number;
  operatorsDueSoon: number;
  totalProcessingActivities: number;
  activitiesOverdue: number;
  activitiesDueSoon: number;
  openFindings: number;
  breachesOpen: number;
  breachesUnreported: number;
  breachesThisMonth: number;
}

export const getDashboardStats = cache((): Promise<DashboardStats> => apiFetch("/dashboard/stats"));

export interface NeedsAttentionItem {
  id: string;
  domain: "operator" | "processing-activity" | "assessment" | "breach";
  title: string;
  subtitle: string;
  href: string;
  tone: BadgeTone;
  urgencyRank: number;
}

export const getNeedsAttentionFeed = cache(
  (): Promise<NeedsAttentionItem[]> => apiFetch("/dashboard/needs-attention")
);
