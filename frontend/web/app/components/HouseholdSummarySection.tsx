"use client";

import { useState } from "react";
import { HouseholdSummary } from "../../lib/expenses";
import { formatCurrency } from "../../lib/format";
import { PaymentSummary } from "./PaymentSummary";
import { ActivityCycleList } from "./ActivityCycleList";
import { SettlementDialog } from "./SettlementDialog";
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

interface Props {
  summary: HouseholdSummary | null;
  state: "idle" | "loading" | "error";
  error: string | null;
  onSettlementAdded: () => Promise<void>;
}

export function HouseholdSummarySection({
  summary,
  state,
  error,
  onSettlementAdded,
}: Props) {
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);

  const suggestedFrom: "Me" | "Partner" =
    summary && summary.netOwedToPartner > 0 ? "Me" : "Partner";

  const suggestedAmount = summary
    ? Math.max(summary.netOwedToMe, summary.netOwedToPartner)
    : 0;

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
          <Typography>Loading summary...</Typography>
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

          <PaymentSummary
            summary={summary}
            onSettleUp={() => setSettlementDialogOpen(true)}
          />

          <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
            Activity Timeline
          </Typography>
          <ActivityCycleList cycles={summary.recentActivityCycles} />

          <SettlementDialog
            open={settlementDialogOpen}
            onClose={() => setSettlementDialogOpen(false)}
            onSettlementAdded={onSettlementAdded}
            suggestedFrom={suggestedFrom}
            suggestedAmount={suggestedAmount}
          />
        </>
      )}
    </Paper>
  );
}
