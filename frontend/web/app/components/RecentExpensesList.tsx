"use client";

import { HouseholdSummary } from "../../lib/expenses";
import { formatCurrency } from "../../lib/format";

export function RecentExpensesList({ summary }: { summary: HouseholdSummary }) {
  const list = summary.recentExpenses || [];
  if (list.length === 0) return <p>No expenses yet this month.</p>;

  return (
    <ul className="expenses">
      {list.map((e) => (
        <li key={e.id} className="expense-item">
          <div>
            <div className="expense-desc">{e.description}</div>
            <div className="expense-meta">
              {e.date || "N/A"} • Paid by {e.paidBy}
            </div>
          </div>
          <div className="expense-amount">{formatCurrency(e.amount)}</div>
        </li>
      ))}
    </ul>
  );
}
