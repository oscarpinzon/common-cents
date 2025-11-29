"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addExpense,
  fetchSummary,
  HouseholdSummary,
  Payer,
  AddExpenseRequest,
} from "../lib/expenses";

type UiState = "idle" | "loading" | "error";

// TODO: Architecture this better
export default function Home() {
  const [summary, setSummary] = useState<HouseholdSummary | null>(null);
  const [summaryState, setSummaryState] = useState<UiState>("loading");
  const [formState, setFormState] = useState<UiState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const [paidBy, setPaidBy] = useState<Payer>("Me" as Payer);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Amount must be a positive number.");
      return;
    }

    // Backend expects date as a string (e.g. "2025-11-24"), not an object.
    const payload: AddExpenseRequest = {
      amount: parsedAmount,
      description,
      date, // send the raw YYYY-MM-DD string
      paidBy,
    };

    try {
      setFormState("loading");
      setErrorMessage(null);

      await addExpense(payload);

      setAmount("");
      setDescription("");

      await loadSummary();
      setFormState("idle");
    } catch (err) {
      console.error(err);
      setFormState("error");
      setErrorMessage("Could not add expense.");
    }
  }

  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <h1>CommonCents</h1>
          <p>Household expenses for you + your partner</p>
        </header>

        <section className="card">
          <h2>Add an expense</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Groceries, rent, coffee..."
                required
              />
            </div>

            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Who paid?</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="paidBy"
                    value="Me"
                    checked={paidBy === "Me"}
                    onChange={() => setPaidBy("Me" as Payer)}
                  />
                  Me
                </label>
                <label>
                  <input
                    type="radio"
                    name="paidBy"
                    value="Partner"
                    checked={paidBy === "Partner"}
                    onChange={() => setPaidBy("Partner" as Payer)}
                  />
                  Partner
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={formState === "loading"}
              className="primary-btn"
            >
              {formState === "loading" ? "Adding..." : "Add expense"}
            </button>
          </form>
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

              <div className="payment-summary">
                <div className="payment-row">
                  <span>You paid:</span>
                  <strong>
                    {(summary.totalPaidByMe ?? 0).toLocaleString(undefined, {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </strong>
                </div>
                <div className="payment-row">
                  <span>Partner paid:</span>
                  <strong>
                    {(summary.totalPaidByPartner ?? 0).toLocaleString(
                      undefined,
                      {
                        style: "currency",
                        currency: "CAD",
                      }
                    )}
                  </strong>
                </div>
                <div className="payment-row">
                  {(() => {
                    const netBalance =
                      summary.totalPaidByMe - summary.totalPaidByPartner;

                    if (netBalance > 0) {
                      return (
                        <>
                          <span>Partner owes you:</span>
                          <strong className="positive">
                            {netBalance.toLocaleString(undefined, {
                              style: "currency",
                              currency: "CAD",
                            })}
                          </strong>
                        </>
                      );
                    } else if (netBalance < 0) {
                      return (
                        <>
                          <span>You owe partner:</span>
                          <strong className="negative">
                            {Math.abs(netBalance).toLocaleString(undefined, {
                              style: "currency",
                              currency: "CAD",
                            })}
                          </strong>
                        </>
                      );
                    } else {
                      return <span>You are even this month!</span>;
                    }
                  })()}
                </div>
              </div>

              <h3>Recent expenses</h3>
              {!summary.recentExpenses ||
              summary.recentExpenses.length === 0 ? (
                <p>No expenses yet this month.</p>
              ) : (
                <ul className="expenses">
                  {summary.recentExpenses.map((e) => (
                    <li key={e.id} className="expense-item">
                      <div>
                        <div className="expense-desc">{e.description}</div>
                        <div className="expense-meta">
                          {e.date || "N/A"} • Paid by {e.paidBy}
                        </div>
                      </div>
                      <div className="expense-amount">
                        {(e.amount ?? 0).toLocaleString(undefined, {
                          style: "currency",
                          currency: "CAD",
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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
