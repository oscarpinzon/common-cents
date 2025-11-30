"use client";

import { HouseholdSummary } from "../../lib/expenses";
import { formatCurrency } from "../../lib/format";
import { Box, Stack, Typography } from "@mui/material";

export function PaymentSummary({ summary }: { summary: HouseholdSummary }) {
  const netBalance =
    (summary.totalPaidByMe ?? 0) - (summary.totalPaidByPartner ?? 0);

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
        {netBalance === 0 && <Typography>You are even this month!</Typography>}
        {netBalance > 0 && (
          <>
            <Typography>Partner owes you:</Typography>
            <Typography fontWeight={600} color="success.main">
              {formatCurrency(netBalance)}
            </Typography>
          </>
        )}
        {netBalance < 0 && (
          <>
            <Typography>You owe partner:</Typography>
            <Typography fontWeight={600} color="error.main">
              {formatCurrency(Math.abs(netBalance))}
            </Typography>
          </>
        )}
      </Stack>
    </Box>
  );
}
