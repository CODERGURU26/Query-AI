"use client";

import { useEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Database, CloudDownload, Upload } from "lucide-react";
import { getHistoryEntries, getSourceLabel, getSourceColor, datasetExists } from "@/lib/history";

interface DataSourceStatusProps {
  onSelectHistory?: () => void;
}

export default function DataSourceStatus({ onSelectHistory }: DataSourceStatusProps) {
  const [postgreSqlConnected, setPostgreSqlConnected] = useState(false);
  const [csvLoaded, setCsvLoaded] = useState<{ dataset_id: string; filename: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPostgreSqlConnection();
    // Check history for last CSV dataset
    const history = getHistoryEntries();
    const lastCsvEntry = history.find((entry) => entry.source === "csv" && entry.dataset_id);
    if (lastCsvEntry && datasetExists(lastCsvEntry.dataset_id)) {
      setCsvLoaded({
        dataset_id: lastCsvEntry.dataset_id,
        filename: ` ${lastCsvEntry.question.substring(0, 30)}...`, // Simplified - ideally store filename separately
      });
    }
    setIsLoading(false);
  }, []);

  const checkPostgreSqlConnection = async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setPostgreSqlConnected(data.status === "healthy");
    } catch {
      setPostgreSqlConnected(false);
    }
  };

  const handleSelect = (question: string) => {
    // Restore query from history
    onSelectHistory?.();
  };

  const renderStatus = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-zinc-500">
          <Database size={14} />
          <span>Checking…</span>
        </div>
      );
    }

    const hasPostgres = postgreSqlConnected;
    const hasCsv = csvLoaded !== null;

    if (hasPostgres && hasCsv) {
      return (
        <div className="flex items-center gap-2">
          <Database size={14} className="text-emerald-400" />
          <span className="text-zinc-400">PostgreSQL Connected</span>
          <span className="ml-2 text-violet-400 font-medium">CSV Loaded</span>
          <span>{csvLoaded!.filename}</span>
        </div>
      );
    } else if (hasPostgres) {
      return (
        <div className="flex items-center gap-2">
          <Database size={14} className="text-emerald-400" />
          <span className="text-zinc-400">PostgreSQL Connected</span>
        </div>
      );
    } else if (hasCsv) {
      return (
        <div className="flex items-center gap-2">
          <CloudDownload size={14} className="text-violet-400" />
          <span className="text-zinc-400">CSV Loaded</span>
          <span className="ml-2 text-violet-400 font-medium">{csvLoaded!.filename}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-zinc-500">
        <Database size={14} />
        <span>No dataset selected</span>
      </div>
    );
  };

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-500"
      aria-label="Data source status"
      role="status"
    >
      {renderStatus()}
    </div>
  );
}