"use client";

import { useState } from "react";
import { addExpense, AddExpenseRequest } from "../../lib/expenses";
import { ExpenseForm } from "./ExpenseForm";
import { Paper } from "@mui/material";

interface Props {
  onExpenseAdded: () => Promise<void>;
}

export function ExpenseFormSection({ onExpenseAdded }: Props) {
  const [formState, setFormState] = useState<"idle" | "loading" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAdd(payload: AddExpenseRequest) {
    setFormState("loading");
    setErrorMessage(null);
    try {
      await addExpense(payload);
      await onExpenseAdded();
      setFormState("idle");
    } catch (err) {
      console.error(err);
      setFormState("error");
      setErrorMessage("Could not add expense.");
    }
  }

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
      <ExpenseForm
        onAdd={handleAdd}
        loading={formState === "loading"}
        error={formState === "error" ? errorMessage : null}
      />
    </Paper>
  );
}
