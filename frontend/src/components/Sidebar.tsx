"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Sparkles } from "lucide-react";
import { getHistoryEntries, getSourceLabel, datasetExists } from "@/lib/history";
import type { HistoryEntryWithSource } from "@/types/query";

interface SidebarProps {
  onSelectHistoryEntry: (entry: HistoryEntryWithSource) => void;
  onClearHistory: () => void;
  onNewQuery: () => void;
  currentSource?: "postgresql" | "csv" | "none";
  currentDatasetId?: string;
  refreshKey?: number;
  activeQuestion?: string;
}

const SOURCE_DOT_COLOR: Record<string, string> = {
  postgresql: "#10b981",
  csv: "#8b5cf6",
  none: "#71717a",
};

export default function Sidebar({
  onSelectHistoryEntry,
  onClearHistory,
  onNewQuery,
  refreshKey = 0,
  activeQuestion,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntryWithSource[]>([]);

  useEffect(() => {
    setEntries(getHistoryEntries());
  }, [refreshKey]);

  const handleSelect = (entry: HistoryEntryWithSource) => {
    if (entry.source === "csv" && entry.dataset_id && !datasetExists(entry.dataset_id)) {
      // Dataset no longer available locally
    }
    onSelectHistoryEntry(entry);
  };

  function formatTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const renderHistoryList = (onItemClick: (entry: HistoryEntryWithSource) => void) => (
    <>
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        History
      </span>
      {entries.length === 0 && (
        <p className="text-sm text-zinc-500 mt-2">
          No history yet. Start by asking a question.
        </p>
      )}
      <div className="mt-2 space-y-1">
        {entries.map((entry, i) => {
          const isActive = activeQuestion === entry.question;
          return (
            <div
              key={`${entry.timestamp}-${i}`}
              role="button"
              tabIndex={0}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all cursor-pointer ${
                isActive
                  ? "bg-violet-500/15 border border-violet-500/30 text-white font-medium"
                  : "hover:bg-white/[0.05] text-zinc-300 hover:text-white"
              }`}
              onClick={() => onItemClick(entry)}
              aria-label={`Load chat: ${entry.question}`}
            >
              <div className="flex-1 min-w-0">
                <p className={`truncate text-sm ${isActive ? "text-white font-medium" : "text-zinc-200"}`}>
                  {entry.question}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                  {formatTime(entry.timestamp)} · {getSourceLabel(entry.source)}
                </p>
              </div>
              <div
                className="w-2 h-2 shrink-0 rounded-full"
                style={{ backgroundColor: SOURCE_DOT_COLOR[entry.source] ?? SOURCE_DOT_COLOR.none }}
              />
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
        aria-label="Query sidebar"
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-white/10">
          {!isCollapsed ? (
            <>
              <span className="text-sm font-medium text-zinc-300">Sidebar</span>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-2 rounded-md hover:bg-white/[0.05] transition-colors shrink-0"
                aria-label="Collapse sidebar"
              >
                <X size={16} className="text-zinc-400" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsCollapsed(false)}
              className="mx-auto p-2 rounded-md hover:bg-white/[0.05] transition-colors"
              aria-label="Expand sidebar"
            >
              <Sparkles size={18} className="text-violet-400" />
            </button>
          )}
        </div>

        {!isCollapsed && (
          <div className="p-4 space-y-4">
            <button
              onClick={onNewQuery}
              className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all hover:bg-white/[0.05] hover:text-white"
              aria-label="New query"
            >
              <span className="text-white font-medium">New Query</span>
              <Sparkles size={14} className="text-violet-400" />
            </button>

            <div>{renderHistoryList(handleSelect)}</div>

            {entries.length > 0 && (
              <button
                onClick={onClearHistory}
                className="w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:bg-white/[0.03] hover:text-white"
                aria-label="Clear history"
              >
                Clear history
                <Trash2 size={12} className="text-zinc-600" />
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {mobileOpen && (
        <div className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden w-72 max-w-[calc(100vw-4rem)] overflow-y-auto rounded-e-2xl bg-zinc-900 p-6 animate-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Sparkles size={14} className="text-violet-400" />
              <span className="text-sm font-medium">QueryAI</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-md hover:bg-white/[0.05] transition-colors"
              aria-label="Close sidebar"
            >
              <X size={18} className="text-zinc-400" />
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                onNewQuery();
                setMobileOpen(false);
              }}
              className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all hover:bg-white/[0.05] hover:text-white"
              aria-label="New query"
            >
              <span className="text-white font-medium">New Query</span>
              <Sparkles size={14} className="text-violet-400" />
            </button>

            {renderHistoryList((entry) => {
              handleSelect(entry);
              setMobileOpen(false);
            })}

            {entries.length > 0 && (
              <button
                onClick={onClearHistory}
                className="w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:bg-white/[0.03] hover:text-white"
                aria-label="Clear history"
              >
                Clear history
                <Trash2 size={12} className="text-zinc-600" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/95 px-4 py-2.5 text-sm text-zinc-400 shadow-lg backdrop-blur"
        aria-label="Open query history"
      >
        <Sparkles size={14} className="text-violet-400" />
        History
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium">
          {entries.length}
        </span>
      </button>
    </>
  );
}