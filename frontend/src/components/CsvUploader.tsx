"use client";

import { useState, useRef } from "react";
import { FileText, Loader2, Check, X, Trash, AlertCircle } from "lucide-react";
import { csvUpload } from "@/lib/api";
import { formatColumnName, formatNumber, isCurrencyColumn } from "@/lib/formatting";
import SmartChart from "./SmartChart";
import KPICards from "./KPICards";
import DataTable from "./DataTable";

interface CsvUploaderProps {
  dataset: {
    dataset_id: string | null;
    filename: string | null;
    rows: number;
    columns: number;
    schema: { name: string; type: string }[];
    preview_data: Record<string, unknown>[];
  } | null;
  onQuestion: (question: string) => void;
}

export default function CsvUploader({ dataset, onQuestion }: CsvUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await csvUpload(file);

      // Update parent dataset state
      if (typeof window !== "undefined") {
        const dataset = {
          dataset_id: response.dataset_id,
          filename: response.filename,
          rows: response.rows,
          columns: response.columns,
          schema: response.schema,
          preview_data: [], // Will be populated on next render
        };
        // The parent already has this state; we signal completion
      }

      setIsLoaded(true);
      setIsUploading(false);

      // Call parent onQuestion with empty question to indicate ready state
      onQuestion("");

    } catch (err: any) {
      setUploadError(err.message || "CSV upload failed.");
      setIsUploading(false);
    }
  };

  if (!isLoaded && !dataset) {
    return (
      <div className="px-6 py-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mb-4">
          <FileText size={32} className="text-violet-400" />
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">Import CSV</h3>
        <p className="text-zinc-500 mb-6">
          Upload a CSV file to analyze your data with natural language questions.
        </p>

        <div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-white"
            aria-label="Import CSV file"
          >
            <FileText size={14} className="mr-2" />
            Select CSV file
          </button>
        </div>

        <p className="text-zinc-500 text-sm mt-4">
          Supported: .csv files with headers, UTF-8 encoding, numeric/text/date columns
        </p>
      </div>
    );
  }

  // Upload complete - show data source panel
  return (
    <div className="px-6 py-8">
      {/* Error state */}
      {uploadError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 mb-6 animate-in fade-in duration-300">
          <AlertCircle size={20} className="mr-2 text-red-300" />
          <span className="text-red-300 text-sm">{uploadError}</span>
          <button
            onClick={() => setUploadError(null)}
            className="ml-auto text-violet-400 text-sm hover:text-violet-300 transition-colors"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Data source panel */}
      {isLoaded && dataset && !uploadError && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
              <FileText size={14} />
            </div>
            <div>
              <p className="font-semibold text-white">{dataset.filename}</p>
              <p className="text-xs text-zinc-500">
                {dataset.rows} rows · {dataset.columns} columns
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onQuestion("")}
              className="flex-1 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-sm font-medium text-violet-400 transition-all hover:bg-violet-500/25 hover:text-violet-300"
              aria-label="Ask questions about this data"
            >
              [ Ask questions about this data ]
            </button>
          </div>

          {/* Schema expandable section */}
          {dataset.schema.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-400 hover:bg-white/[0.05] transition-colors">
                View schema
              </summary>
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                {dataset.schema.map((col, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-zinc-400 text-xs"
                  >
                    <span>{col.name}</span>
                    <span>{col.type}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Data preview expandable section */}
          {dataset.preview_data && dataset.preview_data.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-400 hover:bg-white/[0.05] transition-colors">
                Data preview ({dataset.preview_data.length} rows)
              </summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {dataset.schema.map((col) => (
                        <th key={col.name} className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                          {formatColumnName(col.name)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.preview_data.map((row, rowIdx) => {
                      const displayRows = rowIdx < 5;
                      if (!displayRows) return null;
                      return (
                        <tr key={rowIdx}>
                          {dataset.schema.map((col) => {
                            const value = row[col.name];
                            return (
                              <td
                                key={col.name}
                                className={`px-6 py-3 text-zinc-300 ${
                                  isCurrencyColumn(col.name) ? "font-mono text-right" : ""
                                }`}
                              >
                                {value !== undefined && value !== null ? (
                                  typeof value === "number"
                                    ? formatNumber(value as number)
                                    : String(value).replace(/_/g, " ")
                                ) : (
                                  "—"
                                )
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </div>
      )}

      {/* Error state when no dataset loaded */}
      {!isLoaded && uploadError === null && dataset === null && (
        <div className="px-6 py-8 text-center">
          <p className="text-zinc-500 mb-4">Upload a CSV file to get started.</p>
        </div>
      )}
    </div>
  );
}