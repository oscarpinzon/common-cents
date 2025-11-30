import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CommonCents",
  description: "Track and settle household expenses",
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
