"use client";

import { HouseholdSummary } from "../../lib/expenses";
import { formatCurrency } from "../../lib/format";

export function PaymentSummary({ summary }: { summary: HouseholdSummary }) {
  const netBalance =
    (summary.totalPaidByMe ?? 0) - (summary.totalPaidByPartner ?? 0);

  return (
    <div className="payment-summary">
      <div className="payment-row">
        <span>You paid:</span>
        <strong>{formatCurrency(summary.totalPaidByMe)}</strong>
      </div>
      <div className="payment-row">
        <span>Partner paid:</span>
        <strong>{formatCurrency(summary.totalPaidByPartner)}</strong>
      </div>
      <div className="payment-row">
        {netBalance === 0 && <span>You are even this month!</span>}
        {netBalance > 0 && (
          <>
            <span>Partner owes you:</span>
            <strong className="positive">{formatCurrency(netBalance)}</strong>
          </>
        )}
        {netBalance < 0 && (
          <>
            <span>You owe partner:</span>
            <strong className="negative">
              {formatCurrency(Math.abs(netBalance))}
            </strong>
          </>
        )}
      </div>
    </div>
  );
}
