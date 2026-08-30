import { v4 as uuidv4 } from "uuid";
import { formatColumnName, formatDisplayValue } from "./formatting";

/**
 * Export data as CSV file.
 * Safely handles commas, quotes, newlines, Unicode, and null values.
 *
 * @param columns - Column names
 * @param data - Row data records
 * @returns void (triggers download)
 */
export function exportCSV(columns: string[], data: Record<string, unknown>[]) {
  if (!data || data.length === 0) return;

  // Generate a meaningful filename based on the question/data
  const timestamp = new Date().toISOString().split("T")[0];
  const safeFilename = generateFilename(columns, data.length);

  // Prepare header row - sanitize column names
  const sanitizedHeaders = columns.map((col) =>
    `"${col.replace(/"/g, '""')}"`
  );

  // Prepare data rows - safely quote values
  const sanitizedRows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col];
        if (value === null || value === undefined) {
          return "";
        }
        const strValue = String(value);
        // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (strValue.includes(",") || strValue.includes('"') || strValue.includes("\n")) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      })
      .join(",")
  );

  // Build full CSV: header + rows
  const csvContent = [sanitizedHeaders, ...sanitizedRows].join("\n");

  // Trigger download
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", safeFilename);
  link.style("visibility", "hidden");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a meaningful filename from the query/data.
 * Sanitizes for use as a filename.
 */
function generateFilename(columns: string[], rowCount: number): string {
  // Try to derive a meaningful prefix from column names
  // Use the first numeric/important column name, or a generic prefix
  let prefix = "queryai-result";

  // Look for common sales/metric column names for meaningful filename
  for (const col of columns) {
    const lower = col.toLowerCase();
    if (
      lower.includes("name") ||
      lower.includes("category") ||
      lower.includes("product") ||
      lower.includes("sales") ||
      lower.includes("revenue") ||
      lower.includes("total")
    ) {
      // Use a short version of the column name
      const shortName = col
        .replace(/_/g, "-")
        .replace(/\s/g, "-")
        .substring(0, 20);
      prefix = `queryai-${shortName}`;
      break;
    }
  }

  // Sanitize: replace problematic characters
  const sanitized = prefix
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Append timestamp and row count info
  const countTag = rowCount > 0 ? `-${rowCount}rows` : "";
  const dateTag = timestamp.replace(/-/g, "");

  return `queryai-${sanitized}${countTag}-${dateTag}.csv`;
}

/**
 * Import CSV file from user upload.
 * Returns parsed data with metadata.
 *
 * @param file - CSV file uploaded by user
 * @returns Parsed CSV data and metadata
 */
export async function importCSV(file: File): Promise<{
  data: Record<string, unknown>[];
  columns: string[];
  schema: { name: string; type: string }[];
  filename: string;
  rows: number;
  missingValues: Record<string, number>;
}> {
  const content = await file.text();

  // Parse CSV
  const parser = new DOMParser();
  const parsed = parser.parseFromString(
    content.replace(/\r\n|\r/g, "\n"),
    "text/csv"
  );

  const rows: string[][] = [];
  const headers: string[] = [];

  // Simple CSV parsing
  const lines = parsed.querySelectorAll("tr");
  lines.forEach((line, i) => {
    const cells = line.querySelectorAll("td, th");
    const row: string[] = [];
    cells.forEach((cell) => {
      const text = cell.textContent || "";
      row.push(text);
    });
    if (i === 0) {
      headers.push(...row);
    } else {
      rows.push(row);
    }
  });

  // If DOMParser didn't work, fall back to manual parsing
  if (headers.length === 0) {
    // Manual CSV parsing fallback
    const linesArray = content.split("\n");
    linesArray.forEach((line, i) => {
      // Simple split by comma (not handling quoted fields perfectly)
      const cells = line.split(",");
      if (i === 0) {
        headers.push(...cells.map((c) => c.trim()));
      } else {
        rows.push(cells.map((c) => c.trim()));
      }
    });
  }

  // Clean up headers - remove quotes if present
  const cleanHeaders = headers.map((h) => h.replace(/^"|"$/g, ""));

  // Build data records
  const data: Record<string, unknown>[] = [];
  rows.forEach((row) => {
    const record: Record<string, unknown> = {};
    row.forEach((cell, i) => {
      if (i < cleanHeaders.length) {
        // Try to detect type
        if (/^\d+$/.test(cell)) {
          record[cleanHeaders[i]] = Number(cell);
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(cell)) {
          record[cleanHeaders[i]] = cell; // Keep as string date
        } else if (cell === "") {
          record[cleanHeaders[i]] = null;
        } else {
          record[cleanHeaders[i]] = cell;
        }
      }
    });
    data.push(record);
  });

  // Count missing values
  const missingValues: Record<string, number> = {};
  cleanHeaders.forEach((header) => {
    missingValues[header] = 0;
  });
  data.forEach((record) => {
    cleanHeaders.forEach((header) => {
      if (record[header] === null || record[header] === undefined) {
        missingValues[header] = (missingValues[header] || 0) + 1;
      }
    });
  });

  return {
    data,
    columns: cleanHeaders,
    schema: cleanHeaders.map((name) => ({
      name,
      type: detectType(name, data),
    })),
    filename: file.name,
    rows: data.length,
    missingValues,
  };
}

/**
 * Detect the data type of a column based on sample values.
 */
function detectType(columnName: string, data: Record<string, unknown>[]): string {
  const values = data
    .map((row) => row[columnName])
    .filter((v) => v !== null && v !== undefined);

  if (values.length === 0) return "text";

  const numericCount = values.filter(
    (v) => typeof v === "number" || (/^-?\d+\.?\d*$/.test(String(v)))
  ).length;
  const dateCount = values.filter(
    (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v))
  ).length;

  if (numericCount > values.length * 0.8) return "numeric";
  if (dateCount > values.length * 0.8) return "date";
  return "text";
}