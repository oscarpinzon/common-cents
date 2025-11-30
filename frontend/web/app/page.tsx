"use client";

import { useEffect, useState } from "react";
import { addExpense, AddExpenseRequest } from "../lib/expenses";
import { ExpenseForm } from "./components/ExpenseForm";
import { PaymentSummary } from "./components/PaymentSummary";
import { RecentExpensesList } from "./components/RecentExpensesList";
import { useHouseholdSummary } from "./hooks/useHouseholdSummary";
import { formatCurrency } from "../lib/format";
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";

type UiState = "idle" | "loading" | "error";

export default function Home() {
  const {
    summary,
    state: summaryState,
    error: summaryError,
    refresh,
  } = useHouseholdSummary();
  const [formState, setFormState] = useState<UiState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        <Box component="header">
          <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
            CommonCents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Household expenses for you + your partner
          </Typography>
        </Box>

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
          <ExpenseForm
            onAdd={async (payload: AddExpenseRequest) => {
              setFormState("loading");
              setErrorMessage(null);
              try {
                await addExpense(payload);
                await refresh();
                setFormState("idle");
              } catch (err) {
                console.error(err);
                setFormState("error");
                setErrorMessage("Could not add expense.");
              }
            }}
            loading={formState === "loading"}
            error={formState === "error" ? errorMessage : null}
          />
        </Paper>

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

          {summaryState === "loading" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
              <CircularProgress size={20} />
              <Typography>Loading summary…</Typography>
            </Box>
          )}

          {summaryState === "error" && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {summaryError ?? "Could not load summary."}
            </Alert>
          )}

          {summary && summaryState === "idle" && (
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

          {errorMessage && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {errorMessage}
            </Alert>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
