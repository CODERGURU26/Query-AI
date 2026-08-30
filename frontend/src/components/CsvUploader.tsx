"use client";

import { useState, useRef, DragEvent } from "react";
import { FileText, Loader2, AlertCircle, Upload, CheckCircle2, X, Table2 } from "lucide-react";
import { csvUpload } from "@/lib/api";
import { formatColumnName, formatNumber, isCurrencyColumn } from "@/lib/formatting";

export interface CsvDataset {
  dataset_id: string | null;
  filename: string | null;
  rows: number;
  columns: number;
  schema: { name: string; type: string }[];
  preview_data?: Record<string, unknown>[];
}

interface CsvUploaderProps {
  dataset: CsvDataset | null;
  onUploadComplete: (dataset: CsvDataset) => void;
  onClose?: () => void;
  onClearDataset?: () => void;
}

export default function CsvUploader({
  dataset,
  onUploadComplete,
  onClose,
  onClearDataset,
}: CsvUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setUploadError("Please drop a valid .csv file.");
        return;
      }
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await csvUpload(file);
      onUploadComplete({
        ...result,
        preview_data: [],
      });
      setIsUploading(false);
    } catch (err: any) {
      setUploadError(err.message || "CSV upload failed. Please verify your file format.");
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/90 backdrop-blur-md p-6 shadow-2xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
            <Upload size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              {dataset ? "Active CSV Dataset" : "Upload Custom CSV"}
            </h3>
            <p className="text-xs text-zinc-400">
              {dataset
                ? "Query this dataset using natural language"
                : "Upload any .csv file to analyze it with AI-powered SQL"}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Error notification */}
      {uploadError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 mb-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-200">Upload failed</p>
            <p className="text-xs text-red-300/80 mt-0.5">{uploadError}</p>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-red-300 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Zone (when no dataset or to replace) */}
      {!dataset ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            isDragging
              ? "border-violet-400 bg-violet-500/10"
              : "border-white/10 hover:border-violet-500/40 bg-white/[0.02] hover:bg-white/[0.04]"
          }`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />

          <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center mb-3 text-violet-400">
            {isUploading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <FileText size={24} />
            )}
          </div>

          <p className="text-sm font-medium text-white mb-1">
            {isUploading ? "Uploading and processing dataset..." : "Click or drag & drop CSV file"}
          </p>
          <p className="text-xs text-zinc-500 mb-4 text-center">
            Supports standard CSVs with column headers (UTF-8, up to 50MB)
          </p>

          <button
            type="button"
            disabled={isUploading}
            className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2 text-xs font-medium text-white transition-colors"
          >
            {isUploading ? "Processing..." : "Select File"}
          </button>
        </div>
      ) : (
        /* Active Dataset Panel */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate text-sm">
                  {dataset.filename}
                </p>
                <p className="text-xs text-zinc-400">
                  <span className="text-violet-300 font-mono font-medium">
                    {formatNumber(dataset.rows)}
                  </span>{" "}
                  rows ·{" "}
                  <span className="text-violet-300 font-mono font-medium">
                    {dataset.columns}
                  </span>{" "}
                  columns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                Replace CSV
              </button>
              {onClearDataset && (
                <button
                  onClick={onClearDataset}
                  className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-colors"
                >
                  Return to PostgreSQL
                </button>
              )}
            </div>
          </div>

          {/* Schema Explorer */}
          {dataset.schema.length > 0 && (
            <details className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all">
              <summary className="flex items-center justify-between cursor-pointer text-xs font-medium text-zinc-400 group-open:text-white">
                <span className="flex items-center gap-2">
                  <Table2 size={14} className="text-violet-400" />
                  Dataset Columns & Schema ({dataset.schema.length} fields)
                </span>
                <span className="text-[10px] text-zinc-500 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2 border-t border-white/5 max-h-48 overflow-y-auto">
                {dataset.schema.map((col, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col justify-between"
                  >
                    <span className="text-xs font-medium text-zinc-200 truncate" title={col.name}>
                      {formatColumnName(col.name)}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono mt-1">
                      {col.type}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}