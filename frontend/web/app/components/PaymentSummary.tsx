"use client";

import { HouseholdSummary } from "../../lib/expenses";
import { formatCurrency } from "../../lib/format";
import { Box, Button, Stack, Typography } from "@mui/material";

interface PaymentSummaryProps {
  summary: HouseholdSummary;
  onSettleUp?: () => void;
}

export function PaymentSummary({ summary, onSettleUp }: PaymentSummaryProps) {
  const hasBalance =
    summary.netOwedToMe > 0 || summary.netOwedToPartner > 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        mb: 1.5,
        p: 2,
        bgcolor: "#111827",
        borderRadius: 1,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography>You paid:</Typography>
        <Typography fontWeight={600}>
          {formatCurrency(summary.totalPaidByMe)}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography>Partner paid:</Typography>
        <Typography fontWeight={600}>
          {formatCurrency(summary.totalPaidByPartner)}
        </Typography>
      </Stack>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          mt: 0.5,
          pt: 0.75,
          borderTop: 1,
          borderColor: "#1f2937",
        }}
      >
        {!hasBalance && (
          <Typography color="text.secondary">You are even!</Typography>
        )}
        {summary.netOwedToMe > 0 && (
          <>
            <Typography>Partner owes you:</Typography>
            <Typography fontWeight={600} color="success.main">
              {formatCurrency(summary.netOwedToMe)}
            </Typography>
          </>
        )}
        {summary.netOwedToPartner > 0 && (
          <>
            <Typography>You owe partner:</Typography>
            <Typography fontWeight={600} color="error.main">
              {formatCurrency(summary.netOwedToPartner)}
            </Typography>
          </>
        )}
      </Stack>

      {hasBalance && onSettleUp && (
        <Button
          variant="outlined"
          size="small"
          onClick={onSettleUp}
          sx={{ mt: 1, alignSelf: "flex-end" }}
        >
          Settle Up
        </Button>
      )}
    </Box>
  );
}
