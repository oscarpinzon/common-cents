"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addExpense,
  fetchSummary,
  HouseholdSummary,
  AddExpenseRequest,
} from "../lib/expenses";
import { ExpenseForm } from "./components/ExpenseForm";
import { PaymentSummary } from "./components/PaymentSummary";
import { RecentExpensesList } from "./components/RecentExpensesList";

type UiState = "idle" | "loading" | "error";

// TODO: Architecture this better
export default function Home() {
  const [summary, setSummary] = useState<HouseholdSummary | null>(null);
  const [summaryState, setSummaryState] = useState<UiState>("loading");
  const [formState, setFormState] = useState<UiState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      setSummaryState("loading");
      setErrorMessage(null);
      const data = await fetchSummary();
      setSummary(data);
      setSummaryState("idle");
    } catch (err) {
      console.error(err);
      setSummaryState("error");
      setErrorMessage("Could not load household summary.");
    }
  }, []);

  useEffect(() => {
    void loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <h1>CommonCents</h1>
          <p>Household expenses for you + your partner</p>
        </header>

        <section className="card">
          <ExpenseForm
            onAdd={async (payload: AddExpenseRequest) => {
              setFormState("loading");
              setErrorMessage(null);
              try {
                await addExpense(payload);
                await loadSummary();
                setFormState("idle");
              } catch (err) {
                console.error(err);
                setFormState("error");
                setErrorMessage("Could not add expense.");
              }
            }}
            loading={formState === "loading"}
            error={formState === "error" ? errorMessage : null}
          />
        </section>

        <section className="card">
          <h2>Household summary</h2>

          {summaryState === "loading" && <p>Loading summary…</p>}
          {summaryState === "error" && (
            <p className="error">Could not load summary.</p>
          )}

          {summary && summaryState === "idle" && (
            <>
              <p className="total">
                This month&apos;s total:{" "}
                <strong>
                  {(summary.total ?? 0).toLocaleString(undefined, {
                    style: "currency",
                    currency: "CAD",
                  })}
                </strong>
              </p>

              <PaymentSummary summary={summary} />
              <h3>Recent expenses</h3>
              <RecentExpensesList summary={summary} />
            </>
          )}

          {errorMessage && (
            <p className="error" style={{ marginTop: "0.5rem" }}>
              {errorMessage}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
