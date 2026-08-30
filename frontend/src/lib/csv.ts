/**
 * Generate and download a CSV file from query results.
 * Uses the already-available response data — no extra API call.
 */
export function exportCSV(
  columns: string[],
  data: Record<string, unknown>[],
  filename: string = "queryai-results.csv"
): void {
  const escapeCell = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    // Escape fields containing commas, quotes, or newlines
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map(escapeCell).join(",");
  const rows = data.map((row) =>
    columns.map((col) => escapeCell(row[col])).join(",")
  );

  const csvContent = [header, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
