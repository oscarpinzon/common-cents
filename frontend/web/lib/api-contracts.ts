import type { components } from "./api-types";

// Raw types from OpenAPI
export type RawHouseholdSummary = components["schemas"]["HouseholdSummaryDto"];
export type RawActivityCycle = components["schemas"]["ActivityCycleDto"];
export type RawActivityItem = components["schemas"]["ActivityItemDto"];
export type AddExpenseRequest = components["schemas"]["AddExpenseRequest"];
export type AddSettlementRequest = components["schemas"]["AddSettlementRequest"];

// Payer type - string literals for form inputs and display
export type Payer = "Me" | "Partner";

// Activity item type enum
export enum ActivityItemType {
  Expense = 1,
  Settlement = 2,
}

// Strict app-facing types
export type ActivityItem = {
  occurredAtUtc: string;
  type: ActivityItemType;
  description: string | null;
  paidBy: Payer | null;
  from: Payer | null;
  to: Payer | null;
  amount: number;
  netAfterThisItem: number;
};

export type ActivityCycle = {
  isSettled: boolean;
  startedAtUtc: string;
  settledAtUtc: string | null;
  netAtEnd: number;
  items: ActivityItem[];
};

export type HouseholdSummary = {
  year: number;
  month: number;
  total: number;
  totalPaidByMe: number;
  totalPaidByPartner: number;
  netOwedToMe: number;
  netOwedToPartner: number;
  recentActivityCycles: ActivityCycle[];
};

// Helper to convert Payer integer (0=Me, 1=Partner) to string
function normalizePayer(raw: number | undefined | null): Payer | null {
  if (raw === 0) return "Me";
  if (raw === 1) return "Partner";
  return null;
}

// Normalization functions
function normalizeActivityItem(raw: RawActivityItem): ActivityItem {
  return {
    occurredAtUtc: raw.occurredAtUtc ?? "",
    type: raw.type ?? ActivityItemType.Expense,
    description: raw.description ?? null,
    paidBy: normalizePayer(raw.paidBy),
    from: normalizePayer(raw.from),
    to: normalizePayer(raw.to),
    amount: raw.amount ?? 0,
    netAfterThisItem: raw.netAfterThisItem ?? 0,
  };
}

function normalizeActivityCycle(raw: RawActivityCycle): ActivityCycle {
  return {
    isSettled: raw.isSettled ?? false,
    startedAtUtc: raw.startedAtUtc ?? "",
    settledAtUtc: raw.settledAtUtc ?? null,
    netAtEnd: raw.netAtEnd ?? 0,
    items: (raw.items ?? []).map(normalizeActivityItem),
  };
}

export function normalizeHouseHoldSummary(
  raw: RawHouseholdSummary
): HouseholdSummary {
  return {
    year: raw.year ?? 0,
    month: raw.month ?? 0,
    total: raw.total ?? 0,
    totalPaidByMe: raw.totalPaidByMe ?? 0,
    totalPaidByPartner: raw.totalPaidByPartner ?? 0,
    netOwedToMe: raw.netOwedToMe ?? 0,
    netOwedToPartner: raw.netOwedToPartner ?? 0,
    recentActivityCycles: (raw.recentActivityCycles ?? []).map(
      normalizeActivityCycle
    ),
  };
}

// Helper to get payer display name (identity function for string type)
export function getPayerName(payer: Payer | null): string {
  return payer ?? "Unknown";
}
