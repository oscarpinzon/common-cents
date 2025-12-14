"use client";

import { ActivityCycle } from "../../lib/expenses";
import { formatDateRange } from "../../lib/format";
import { ActivityItemRow } from "./ActivityItemRow";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  List,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface ActivityCycleAccordionProps {
  cycle: ActivityCycle;
  defaultExpanded: boolean;
}

export function ActivityCycleAccordion({
  cycle,
  defaultExpanded,
}: ActivityCycleAccordionProps) {
  const dateRange = formatDateRange(cycle.startedAtUtc, cycle.settledAtUtc);

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      sx={{
        bgcolor: "background.paper",
        "&:before": { display: "none" },
        borderRadius: 1,
        border: 1,
        borderColor: "#1f2937",
        "&.Mui-expanded": {
          margin: 0,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 48,
          "&.Mui-expanded": { minHeight: 48 },
          "& .MuiAccordionSummary-content": {
            margin: "12px 0",
            "&.Mui-expanded": { margin: "12px 0" },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            pr: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography fontWeight={500}>
              {cycle.isSettled ? "Settled Cycle" : "Current Cycle"}
            </Typography>
            {cycle.isSettled && (
              <Chip
                label="Settled"
                color="success"
                size="small"
                sx={{ height: 22 }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {dateRange}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 1 }}>
        <List sx={{ p: 0 }}>
          {cycle.items.map((item, index) => (
            <ActivityItemRow key={index} item={item} />
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
