"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0f172a", paper: "#020617" },
    text: { primary: "#e5e7eb", secondary: "#9ca3af" },
    primary: { main: "#38bdf8" },
    error: { main: "#f97373" },
    success: { main: "#34d399" },
  },
  shape: { borderRadius: 12 },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
