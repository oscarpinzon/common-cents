import type { components } from "./api-types";

export type RawHouseholdSummary = components["schemas"]["HouseholdSummaryDto"];

export type Expense = components["schemas"]["ExpenseDto"];

export type AddExpenseRequest = components["schemas"]["AddExpenseRequest"];

// Convenience alias
export type Payer = AddExpenseRequest["paidBy"];

// Strict app-facing types
export type HouseholdSummary = {
  year: number;
  month: number;
  total: number;
  totalPaidByMe: number;
  totalPaidByPartner: number;
  netOwedToMe: number;
  netOwedToPartner: number;
  recentExpenses: RawHouseholdSummary["recentExpenses"];
};

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
    recentExpenses: raw.recentExpenses ?? [],
  };
}
