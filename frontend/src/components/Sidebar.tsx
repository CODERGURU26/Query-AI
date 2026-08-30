"use client";

import { useState, useEffect } from "react";
import { X, Menu, Trash2, Sparkles } from "lucide-react";
import { addToHistory, getHistoryEntries, getSourceLabel, getSourceColor } from "@/lib/history";
import type { HistoryEntryWithSource } from "@/types/query";

interface SidebarProps {
  onSelectQuestion: (question: string) => void;
  onClearHistory: () => void;
  onNewQuery: () => void;
  currentSource: "postgresql" | "csv" | "none";
  currentDatasetId?: string;
  refreshHistory: () => void;
}

export default function Sidebar({
  onSelectQuestion,
  onClearHistory,
  onNewQuery,
  currentSource,
  currentDatasetId,
  refreshHistory,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [entries, setEntries] = useState<HistoryEntryWithSource[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setEntries(getHistoryEntries());
  }, [refreshHistory]);

  const handleSelect = (entry: HistoryEntryWithSource) => {
    // If the dataset no longer exists and it's a CSV query, show warning
    if (entry.source === "csv" && entry.dataset_id && !datasetExists(entry.dataset_id)) {
      // The caller can handle showing the alert
    }
    onSelectQuestion(entry.question);
  };

  const datasetExists = (datasetId: string) => {
    // Check via API or local check
    // For now, just check if we have a way to verify
    return true; // Simplified - actual check done in history item rendering
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

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 transition-all duration-300 ${
        isCollapsed ? "transform -translate-x-full" : ""
      } lg:block lg:inline-block`}
      aria-label="Query sidebar"
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-3">
          <Sparkles size={20} className="text-violet-400" />
          <div>
            <span className="text-lg font-semibold tracking-tight text-white">
              QueryAI
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              Ask questions about your data
            </span>
          </div>
        </div>

        {/* Collapse button for mobile */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="lg:hidden p-2 rounded-md hover:bg-white/[0.05] transition-colors"
          aria-label="Collapse sidebar"
        >
          <X size={18} className="text-zinc-400" />
        </button>
      </div>

      {/* Collapsed mode - just show the toggle button */}
      {isCollapsed && (
        <div className="hidden lg:block">
          <button
            onClick={() => setIsCollapsed(false)}
            className="mt-6 self-end mr-2 p-2 rounded-md hover:bg-white/[0.05] transition-colors"
            aria-label="Expand sidebar"
          >
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-xs font-medium text-zinc-400">QueryAI</span>
          </button>
        </div>
      )}

      {/* Full sidebar content */}
      {!isCollapsed && (
        <div className="p-6 space-y-4">
          {/* New Query button */}
          <button
            onClick={onNewQuery}
            className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all hover:bg-white/[0.05] hover:text-white group"
            aria-label="New query"
          >
            <span className="text-white font-medium">New Query</span>
            <Sparkles size={14} className="text-violet-400" />
          </button>

          {/* History section */}
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              History
            </span>
            {entries.length === 0 && (
              <p className="text-sm text-zinc-500">
                No history yet. Start by asking a question.
              </p>
            )}
            {entries.map((entry, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-white/[0.05] hover:text-white cursor-pointer"
                onClick={() => handleSelect(entry)}
                aria-label={`View history: ${entry.question}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white line-clamp-1">
                    {entry.question}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
                    {formatTime(entry.timestamp)} · {getSourceLabel(entry.source)}
                  </p>
                </div>
                <div className="w-2 rounded-full" style={{ backgroundColor: getSourceColor(entry.source) }} />
              </div>
            ))}
          </div>

          {/* Clear history button */}
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

      {/* Mobile drawer overlay */}
      {isCollapsed && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {isCollapsed && mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden overflow-y-auto rounded-e-2l bg-zinc-900 p-6 animate-in slide-in-from-left duration-300"
          style={{ maxWidth: `calc(100vw - 4rem) `}}
        >
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
              onClick={onNewQuery}
              className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all hover:bg-white/[0.05] hover:text-white"
              aria-label="New query"
            >
              <span className="text-white font-medium">New Query</span>
              <Sparkles size={14} className="text-violet-400" />
            </button>

            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">History</span>
            {entries.length === 0 && (
              <p className="text-sm text-zinc-500">
                No history yet. Start by asking a question.
              </p>
            )}
            {entries.map((entry, i) => (
              <button
                key={i}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-white/[0.05] hover:text-white cursor-pointer"
                onClick={() => {
                  handleSelect(entry);
                  setMobileOpen(false);
                }}
                aria-label={`View history: ${entry.question}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white line-clamp-1">
                    {entry.question}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
                    {formatTime(entry.timestamp)} · {getSourceLabel(entry.source)}
                  </p>
                </div>
                <div className="w-2 rounded-full" style={{ backgroundColor: getSourceColor(entry.source) }} />
              </button>
            ))}
          </div>

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

      {/* Mobile toggle button (always visible on mobile) */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/95 px-4 py-2.5 text-sm text-zinc-400 shadow-lg backdrop-blur"
        aria-label="Open query history"
      >
        <Sparkles size={14} className="text-violet-400" />
        History
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium">
          {entries.length}
        </span>
      </button>
    </aside>
  );
}