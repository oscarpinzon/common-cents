import type { components } from "./api-types";

export type HouseholdSummary = components["schemas"]["HouseholdSummaryDto"];

export type Expense = components["schemas"]["ExpenseDto"];

export type AddExpenseRequest = components["schemas"]["AddExpenseRequest"];

// Convenience alias
export type Payer = AddExpenseRequest["paidBy"];
