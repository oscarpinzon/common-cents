"use client";

import { useState } from "react";
import { addSettlement, AddSettlementRequest } from "../../lib/expenses";
import { SettlementForm } from "./SettlementForm";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface SettlementDialogProps {
  open: boolean;
  onClose: () => void;
  onSettlementAdded: () => Promise<void>;
  suggestedFrom?: "Me" | "Partner";
  suggestedAmount?: number;
}

export function SettlementDialog({
  open,
  onClose,
  onSettlementAdded,
  suggestedFrom,
  suggestedAmount,
}: SettlementDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(settlement: AddSettlementRequest) {
    setLoading(true);
    setError(null);
    try {
      await addSettlement(settlement);
      await onSettlementAdded();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add settlement");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (!loading) {
      setError(null);
      onClose();
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
        Record Settlement
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={loading}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <SettlementForm
          onAdd={handleAdd}
          loading={loading}
          error={error}
          defaultFrom={suggestedFrom}
          defaultAmount={suggestedAmount}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
