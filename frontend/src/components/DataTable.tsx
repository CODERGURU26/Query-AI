"use client";

import { Download } from "lucide-react";
import { formatColumnName, formatDisplayValue } from "@/lib/formatting";
import { exportCSV as exportNativeCSV } from "@/lib/csv";

interface DataTableProps {
  columns: string[];
  data: Record<string, unknown>[];
}

export default function DataTable({ columns, data }: DataTableProps) {
  if (!data || data.length === 0) return null;

  // Detect which columns are numeric (for right-alignment)
  const numericColumns = new Set(
    columns.filter((col) => typeof data[0][col] === "number")
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
            <Download size={14} />
          </div>
          <div>
            <h2 className="font-semibold text-white">Data</h2>
            <p className="text-xs text-zinc-500">
              Showing {data.length} {data.length === 1 ? "result" : "results"}
            </p>
          </div>
        </div>

        <ExportButton columns={columns} data={data} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.02]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className={`whitespace-nowrap px-6 py-3.5 text-xs font-medium uppercase tracking-wider text-zinc-500 ${
                    numericColumns.has(column) ? "text-right" : "text-left"
                  }`}
                >
                  {formatColumnName(column)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-white/5 transition-colors hover:bg-white/[0.02] last:border-0"
              >
                {columns.map((column) => (
                  <td
                    key={column}
                    className={`whitespace-nowrap px-6 py-3.5 text-zinc-300 ${
                      numericColumns.has(column)
                        ? "text-right font-mono text-sm"
                        : "text-left"
                    }`}
                  >
                    {formatDisplayValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ExportButtonProps {
  columns: string[];
  data: Record<string, unknown>[];
}

export function ExportButton({ columns, data }: ExportButtonProps) {
  if (!data || data.length === 0) return null;

  return (
    <button
      id="export-csv"
      onClick={() => exportCSV(columns, data)}
      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-white"
      aria-label="Export results as CSV"
    >
      <Download size={14} />
      Export CSV
    </button>
  );
}

function exportCSV(columns: string[], data: Record<string, unknown>[]) {
  // Use the native CSV export from lib/csv
  if (typeof exportNativeCSV === "function") {
    exportNativeCSV(columns, data);
    return;
  }

  // Fallback: manual CSV generation
  const sanitizedColumns = columns.map((col) =>
    `"${col.replace(/"/g, '""')}"`
  );

  const sanitizedRows = data.map((row) =>
    columns.map((col) => {
      const value = row[col];
      if (value === null || value === undefined) {
        return "";
      }
      const strValue = String(value);
      if (strValue.includes(",") || strValue.includes('"') || strValue.includes("\n")) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    })
  );

  const csvString = [sanitizedColumns.join(","), ...sanitizedRows.join("\n")].join("\n");

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "query-results.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}