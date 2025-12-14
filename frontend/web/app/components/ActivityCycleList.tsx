"use client";

import { ActivityCycle } from "../../lib/expenses";
import { ActivityCycleAccordion } from "./ActivityCycleAccordion";
import { Box, Typography } from "@mui/material";

interface ActivityCycleListProps {
  cycles: ActivityCycle[];
}

export function ActivityCycleList({ cycles }: ActivityCycleListProps) {
  if (cycles.length === 0) {
    return (
      <Typography color="text.secondary">No activity yet.</Typography>
    );
  }

  // Sort: active cycle first, then by date descending (newest first)
  const sortedCycles = [...cycles].sort((a, b) => {
    // Active (unsettled) cycles come first
    if (a.isSettled !== b.isSettled) {
      return a.isSettled ? 1 : -1;
    }
    // Then sort by start date descending
    return new Date(b.startedAtUtc).getTime() - new Date(a.startedAtUtc).getTime();
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {sortedCycles.map((cycle, index) => (
        <ActivityCycleAccordion
          key={cycle.startedAtUtc || index}
          cycle={cycle}
          defaultExpanded={!cycle.isSettled}
        />
      ))}
    </Box>
  );
}
