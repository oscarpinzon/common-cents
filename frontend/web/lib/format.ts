export function formatCurrency(n: number | null | undefined, currency = "CAD") {
  return (n ?? 0).toLocaleString(undefined, { style: "currency", currency });
}
