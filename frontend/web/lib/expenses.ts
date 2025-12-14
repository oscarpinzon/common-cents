import { apiClient } from "./api-client";
import {
  HouseholdSummary,
  normalizeHouseHoldSummary,
  AddExpenseRequest,
  AddSettlementRequest,
  Payer,
  ActivityCycle,
  ActivityItem,
  ActivityItemType,
  getPayerName,
} from "./api-contracts";

export type {
  HouseholdSummary,
  AddExpenseRequest,
  AddSettlementRequest,
  ActivityCycle,
  ActivityItem,
  Payer,
};
export { ActivityItemType, getPayerName };

export async function fetchSummary(): Promise<HouseholdSummary> {
  const { data, error } = await apiClient.GET("/api/household/summary");

  if (error) {
    throw new Error("Failed to load household summary");
  }

  return normalizeHouseHoldSummary(data);
}

export async function addExpense(input: AddExpenseRequest): Promise<void> {
  const { error, response } = await apiClient.POST("/api/household/expenses", {
    body: input,
  });

  if (error) {
    const message = response
      ? (await response.text().catch(() => "")) ||
        response.statusText ||
        "Unknown error"
      : "Unknown error";

    throw new Error(
      `Failed to add expense (${response?.status ?? "unknown"}): ${message}`
    );
  }
}

export async function addSettlement(
  input: AddSettlementRequest
): Promise<void> {
  const { error, response } = await apiClient.POST(
    "/api/household/settlements",
    {
      body: input,
    }
  );

  if (error) {
    const message = response
      ? (await response.text().catch(() => "")) ||
        response.statusText ||
        "Unknown error"
      : "Unknown error";

    throw new Error(
      `Failed to add settlement (${response?.status ?? "unknown"}): ${message}`
    );
  }
}
