"use client";

import {
  ActivityItem,
  ActivityItemType,
  getPayerName,
} from "../../lib/expenses";
import { formatCurrency, formatDate } from "../../lib/format";
import { Box, Chip, ListItem, Typography } from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HandshakeIcon from "@mui/icons-material/Handshake";

interface ActivityItemRowProps {
  item: ActivityItem;
}

export function ActivityItemRow({ item }: ActivityItemRowProps) {
  const isExpense = item.type === ActivityItemType.Expense;
  const isSettlement = item.type === ActivityItemType.Settlement;

  const primaryText = isExpense
    ? item.description || "Expense"
    : item.description || "Settlement";

  const secondaryText = isExpense
    ? `${formatDate(item.occurredAtUtc)} - Paid by ${getPayerName(item.paidBy)}`
    : `${formatDate(item.occurredAtUtc)} - ${getPayerName(item.from)} paid ${getPayerName(item.to)}`;

  const netColor =
    item.netAfterThisItem > 0
      ? "success.main"
      : item.netAfterThisItem < 0
        ? "error.main"
        : "text.secondary";

  return (
    <ListItem
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2,
        py: 1.5,
        px: 1,
        borderBottom: 1,
        borderColor: "#1f2937",
        "&:last-child": {
          borderBottom: 0,
        },
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        <Box
          sx={{
            color: isSettlement ? "primary.main" : "text.secondary",
            mt: 0.5,
          }}
        >
          {isSettlement ? (
            <HandshakeIcon fontSize="small" />
          ) : (
            <ReceiptIcon fontSize="small" />
          )}
        </Box>
        <Box>
          <Typography fontWeight={500}>{primaryText}</Typography>
          <Typography variant="body2" color="text.secondary">
            {secondaryText}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 0.5,
        }}
      >
        <Typography fontWeight={600}>{formatCurrency(item.amount)}</Typography>
        <Chip
          label={
            item.netAfterThisItem >= 0
              ? `+${formatCurrency(item.netAfterThisItem)}`
              : formatCurrency(item.netAfterThisItem)
          }
          size="small"
          sx={{
            height: 20,
            fontSize: "0.7rem",
            bgcolor: "transparent",
            color: netColor,
            border: 1,
            borderColor: netColor,
          }}
        />
      </Box>
    </ListItem>
  );
}
