"use client";

import { useEffect } from "react";
import { useHouseholdSummary } from "./hooks/useHouseholdSummary";
import { PageHeader } from "./components/PageHeader";
import { ExpenseFormSection } from "./components/ExpenseFormSection";
import { HouseholdSummarySection } from "./components/HouseholdSummarySection";
import { Container, Box } from "@mui/material";

export default function Home() {
  const { summary, state, error, refresh } = useHouseholdSummary();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        py: 4,
        px: 2,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <PageHeader />
        <ExpenseFormSection onExpenseAdded={refresh} />
        <HouseholdSummarySection
          summary={summary}
          state={state}
          error={error}
        />
      </Container>
    </Box>
  );
}
