"use client";

import { useState } from "react";
import { AddExpenseRequest, Payer } from "../../lib/expenses";

interface ExpenseFormProps {
  onAdd(expense: AddExpenseRequest): Promise<void>;
  loading: boolean;
  error: string | null;
}

export function ExpenseForm({ onAdd, loading, error }: ExpenseFormProps) {
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [paidBy, setPaidBy] = useState<Payer>("Me" as Payer);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }
    await onAdd({
      amount: parsedAmount,
      description,
      date,
      paidBy,
    });
    setAmount("");
    setDescription("");
  }

  return (
    <>
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
            {(["Me", "Partner"] as Payer[]).map((p) => (
              <label key={p}>
                <input
                  type="radio"
                  name="paidBy"
                  value={p}
                  checked={paidBy === p}
                  onChange={() => setPaidBy(p)}
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="primary-btn">
          {loading ? "Adding..." : "Add expense"}
        </button>
        {error && (
          <p className="error" style={{ marginTop: "0.5rem" }}>
            {error}
          </p>
        )}
      </form>
    </>
  );
}
