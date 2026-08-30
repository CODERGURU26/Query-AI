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
  const csvContent = [sanitizedHeaders.join(","), ...sanitizedRows].join("\n");

  // Trigger download
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", safeFilename);
  link.style.visibility = "hidden";
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
  let prefix = "queryai-result";

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
  const dateTag = new Date().toISOString().split("T")[0].replace(/-/g, "");

  return `${sanitized}${countTag}-${dateTag}.csv`;
}

/**
 * Import CSV file from user upload.
 * Returns parsed data with metadata.
 *
 * Uses a proper RFC4180-style line splitter so quoted fields containing
 * commas/newlines round-trip correctly with exportCSV above.
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
  const normalized = content.replace(/\r\n|\r/g, "\n");

  const records = parseCsvText(normalized);
  if (records.length === 0) {
    return {
      data: [],
      columns: [],
      schema: [],
      filename: file.name,
      rows: 0,
      missingValues: {},
    };
  }

  // Clean up headers - remove wrapping quotes if present
  const cleanHeaders = records[0].map((h) => h.replace(/^"|"$/g, "").trim());
  const rows = records.slice(1);

  // Build data records
  const data: Record<string, unknown>[] = [];
  rows.forEach((row) => {
    // Skip fully blank trailing lines
    if (row.length === 1 && row[0] === "") return;

    const record: Record<string, unknown> = {};
    row.forEach((cell, i) => {
      if (i < cleanHeaders.length) {
        const trimmed = cell.trim();
        if (trimmed === "") {
          record[cleanHeaders[i]] = null;
        } else if (/^-?\d+\.?\d*$/.test(trimmed)) {
          record[cleanHeaders[i]] = Number(trimmed);
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          record[cleanHeaders[i]] = trimmed;
        } else {
          record[cleanHeaders[i]] = trimmed;
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
 * Minimal RFC4180-style CSV line/field parser: handles quoted fields
 * containing commas, escaped quotes (""), and embedded newlines.
 */
function parseCsvText(text: string): string[][] {
  const records: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      field = "";
      records.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  // Flush trailing field/row
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    records.push(row);
  }

  // Drop fully empty trailing records
  while (
    records.length > 0 &&
    records[records.length - 1].length === 1 &&
    records[records.length - 1][0] === ""
  ) {
    records.pop();
  }

  return records;
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