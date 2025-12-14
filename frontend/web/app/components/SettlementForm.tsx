"use client";

import { useState, useEffect } from "react";
import { AddSettlementRequest, Payer } from "../../lib/expenses";
import {
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  Button,
  Stack,
  Alert,
} from "@mui/material";

interface SettlementFormProps {
  onAdd(settlement: AddSettlementRequest): Promise<void>;
  loading: boolean;
  error: string | null;
  defaultFrom?: "Me" | "Partner";
  defaultAmount?: number;
  onCancel?: () => void;
}

export function SettlementForm({
  onAdd,
  loading,
  error,
  defaultFrom = "Me",
  defaultAmount,
  onCancel,
}: SettlementFormProps) {
  const [amount, setAmount] = useState<string>(
    defaultAmount ? defaultAmount.toFixed(2) : ""
  );
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [from, setFrom] = useState<"Me" | "Partner">(defaultFrom);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (defaultAmount !== undefined) {
      setAmount(defaultAmount.toFixed(2));
    }
  }, [defaultAmount]);

  useEffect(() => {
    setFrom(defaultFrom);
  }, [defaultFrom]);

  const to = from === "Me" ? "Partner" : "Me";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }
    await onAdd({
      amount: parsedAmount,
      date,
      from,
      to,
      note: note.trim() || undefined,
    });
    setAmount("");
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          id="settlement-amount"
          label="Amount"
          type="number"
          slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          fullWidth
        />

        <TextField
          id="settlement-date"
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <FormControl component="fieldset">
          <FormLabel component="legend">Who is paying?</FormLabel>
          <RadioGroup
            row
            name="from"
            value={from}
            onChange={(e) => setFrom(e.target.value as "Me" | "Partner")}
          >
            <FormControlLabel value="Me" control={<Radio />} label="Me" />
            <FormControlLabel
              value="Partner"
              control={<Radio />}
              label="Partner"
            />
          </RadioGroup>
        </FormControl>

        <TextField
          id="settlement-note"
          label="Note (optional)"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Venmo, cash, etc..."
          fullWidth
        />

        <Stack direction="row" spacing={1}>
          {onCancel && (
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              fullWidth
            >
              Cancel
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={loading} fullWidth>
            {loading ? "Recording..." : "Record Settlement"}
          </Button>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </form>
  );
}
