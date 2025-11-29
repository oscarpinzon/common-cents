"use client";

import { HouseholdSummary } from "../../lib/expenses";

export function PaymentSummary({ summary }: { summary: HouseholdSummary }) {
  const netBalance =
    (summary.totalPaidByMe ?? 0) - (summary.totalPaidByPartner ?? 0);

  return (
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
          {(summary.totalPaidByPartner ?? 0).toLocaleString(undefined, {
            style: "currency",
            currency: "CAD",
          })}
        </strong>
      </div>
      <div className="payment-row">
        {netBalance === 0 && <span>You are even this month!</span>}
        {netBalance > 0 && (
          <>
            <span>Partner owes you:</span>
            <strong className="positive">
              {netBalance.toLocaleString(undefined, {
                style: "currency",
                currency: "CAD",
              })}
            </strong>
          </>
        )}
        {netBalance < 0 && (
          <>
            <span>You owe partner:</span>
            <strong className="negative">
              {Math.abs(netBalance).toLocaleString(undefined, {
                style: "currency",
                currency: "CAD",
              })}
            </strong>
          </>
        )}
      </div>
    </div>
  );
}
