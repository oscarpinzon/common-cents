"use client";

import { useState } from "react";
import { AddExpenseRequest, Payer } from "../../lib/expenses";
import {
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  Button,
  Typography,
  Stack,
  Alert,
} from "@mui/material";

interface ExpenseFormProps {
  onAdd(expense: AddExpenseRequest): Promise<void>;
  loading: boolean;
  error: string | null;
}

export function ExpenseForm({ onAdd, loading, error }: ExpenseFormProps) {
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [paidBy, setPaidBy] = useState<Payer>("Me" as Payer);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }
    await onAdd({
      amount: parsedAmount,
      description,
      date,
      paidBy,
    });
    setAmount("");
    setDescription("");
  }

  return (
    <>
      <Typography variant="h6" component="h2">
        Add an expense
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            id="amount"
            label="Amount"
            type="number"
            inputProps={{ step: "0.01", min: "0" }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            fullWidth
          />

          <TextField
            id="description"
            label="Description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Groceries, rent, coffee..."
            required
            fullWidth
          />

          <TextField
            id="date"
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <FormControl component="fieldset">
            <FormLabel component="legend">Who paid?</FormLabel>
            <RadioGroup
              row
              name="paidBy"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value as Payer)}
            >
              {(["Me", "Partner"] as Payer[]).map((p) => (
                <FormControlLabel
                  key={p}
                  value={p}
                  control={<Radio />}
                  label={p}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
          >
            {loading ? "Adding..." : "Add expense"}
          </Button>

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </form>
    </>
  );
}
