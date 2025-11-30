"use client";

import { HouseholdSummary } from "../../lib/expenses";
import { formatCurrency } from "../../lib/format";
import { List, ListItem, Typography, Box } from "@mui/material";

export function RecentExpensesList({ summary }: { summary: HouseholdSummary }) {
  const list = summary.recentExpenses || [];
  if (list.length === 0) {
    return (
      <Typography color="text.secondary">
        No expenses yet this month.
      </Typography>
    );
  }

  return (
    <List sx={{ p: 0, mt: 1 }}>
      {list.map((e) => (
        <ListItem
          key={e.id}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            py: 1,
            px: 0,
            borderBottom: 1,
            borderColor: "#111827",
          }}
        >
          <Box>
            <Typography fontWeight={500}>{e.description}</Typography>
            <Typography variant="body2" color="text.secondary">
              {e.date || "N/A"} • Paid by {e.paidBy}
            </Typography>
          </Box>
          <Typography fontWeight={600}>{formatCurrency(e.amount)}</Typography>
        </ListItem>
      ))}
    </List>
  );
}
