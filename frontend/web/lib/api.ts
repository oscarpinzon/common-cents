import type { components } from "./api-types";
export type { paths, components } from "./api-types";

// Convenience exports for commonly used types
export type AddExpenseRequest = components["schemas"]["AddExpenseRequest"];
export type DateOnly = components["schemas"]["DateOnly"];
export type DayOfWeek = components["schemas"]["DayOfWeek"];
