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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {cycles.map((cycle, index) => (
        <ActivityCycleAccordion
          key={cycle.startedAtUtc || index}
          cycle={cycle}
          defaultExpanded={!cycle.isSettled}
        />
      ))}
    </Box>
  );
}
