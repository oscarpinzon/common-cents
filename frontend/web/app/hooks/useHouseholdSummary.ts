"use client";

import { useCallback, useState } from "react";
import { fetchSummary, HouseholdSummary } from "../../lib/expenses";

export type UiState = "idle" | "loading" | "error";

export function useHouseholdSummary() {
  const [summary, setSummary] = useState<HouseholdSummary | null>(null);
  const [state, setState] = useState<UiState>("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setState("loading");
      setError(null);
      const data = await fetchSummary();
      setSummary(data);
      setState("idle");
    } catch (e) {
      console.error(e);
      setState("error");
      setError("Could not load household summary.");
    }
  }, []);

  return { summary, state, error, refresh };
}
