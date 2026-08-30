"use client";

import { Table2 } from "lucide-react";
import { formatDisplayValue, formatColumnName } from "@/lib/formatting";
import ExportButton from "./ExportButton";

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
            <Table2 size={14} />
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
