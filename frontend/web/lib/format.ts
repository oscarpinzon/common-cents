export function formatCurrency(n: number | null | undefined, currency = "CAD") {
  return (n ?? 0).toLocaleString(undefined, { style: "currency", currency });
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateRange(
  startUtc: string,
  endUtc: string | null
): string {
  const start = formatDate(startUtc);
  if (!endUtc) {
    return `${start} - Present`;
  }
  return `${start} - ${formatDate(endUtc)}`;
}
