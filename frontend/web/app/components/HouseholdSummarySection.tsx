"use client";

import { HouseholdSummary } from "../../lib/expenses";
import { formatCurrency } from "../../lib/format";
import { PaymentSummary } from "./PaymentSummary";
import { RecentExpensesList } from "./RecentExpensesList";
import { Paper, Typography, Box, CircularProgress, Alert } from "@mui/material";

interface Props {
  summary: HouseholdSummary | null;
  state: "idle" | "loading" | "error";
  error: string | null;
}

export function HouseholdSummarySection({ summary, state, error }: Props) {
  return (
    <Paper
      component="section"
      sx={{
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
        border: 1,
        borderColor: "#1f2937",
      }}
    >
      <Typography variant="h6" component="h2">
        Household summary
      </Typography>

      {state === "loading" && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
          <CircularProgress size={20} />
          <Typography>Loading summary…</Typography>
        </Box>
      )}

      {state === "error" && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error ?? "Could not load summary."}
        </Alert>
      )}

      {summary && state === "idle" && (
        <>
          <Typography sx={{ mt: 0.5, mb: 2 }}>
            This month&apos;s total:{" "}
            <strong>{formatCurrency(summary.total)}</strong>
          </Typography>

          <PaymentSummary summary={summary} />

          <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
            Recent expenses
          </Typography>
          <RecentExpensesList summary={summary} />
        </>
      )}
    </Paper>
  );
}
