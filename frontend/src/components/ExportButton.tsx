"use client";

import { Download } from "lucide-react";
import { exportCSV } from "@/lib/csv";

interface ExportButtonProps {
  columns: string[];
  data: Record<string, unknown>[];
}

export default function ExportButton({ columns, data }: ExportButtonProps) {
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
