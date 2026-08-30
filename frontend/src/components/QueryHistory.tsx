"use client";

import { useState, useEffect } from "react";
import { Clock, X, Trash2 } from "lucide-react";
import { getHistory, clearHistory } from "@/lib/history";
import type { HistoryEntry } from "@/types/query";

interface QueryHistoryProps {
  onSelect: (question: string) => void;
  refreshKey: number; // increment when history changes
}

export default function QueryHistory({
  onSelect,
  refreshKey,
}: QueryHistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setEntries(getHistory());
  }, [refreshKey]);

  function handleClear() {
    clearHistory();
    setEntries([]);
  }

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

  if (entries.length === 0) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0" aria-label="Query history">
        <div className="sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-zinc-500">
              <Clock size={14} />
              <span className="text-xs font-medium uppercase tracking-wider">
                Recent Queries
              </span>
            </div>
            {entries.length > 0 && (
              <button
                onClick={handleClear}
                className="text-zinc-600 hover:text-zinc-400 transition-colors"
                aria-label="Clear history"
                title="Clear history"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          <div className="space-y-1">
            {entries.map((entry, i) => (
              <button
                key={`${entry.timestamp}-${i}`}
                onClick={() => onSelect(entry.question)}
                className="w-full text-left rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-all hover:bg-white/[0.05] hover:text-white group"
                title={entry.question}
              >
                <p className="truncate text-xs leading-5">
                  {entry.question}
                </p>
                <p className="text-[10px] text-zinc-600 group-hover:text-zinc-500 mt-0.5">
                  {formatTime(entry.timestamp)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/95 px-4 py-2.5 text-sm text-zinc-400 shadow-lg backdrop-blur lg:hidden"
        aria-label="Open query history"
      >
        <Clock size={14} />
        History
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium">
          {entries.length}
        </span>
      </button>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-label="Query history">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-zinc-900 p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock size={14} />
                <span className="text-sm font-medium">Recent Queries</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="text-zinc-600 hover:text-zinc-400 transition-colors p-1"
                  aria-label="Clear history"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors p-1"
                  aria-label="Close history"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {entries.map((entry, i) => (
                <button
                  key={`mobile-${entry.timestamp}-${i}`}
                  onClick={() => {
                    onSelect(entry.question);
                    setIsOpen(false);
                  }}
                  className="w-full text-left rounded-lg px-3 py-3 text-sm text-zinc-400 transition-all hover:bg-white/[0.05] hover:text-white"
                >
                  <p className="truncate">{entry.question}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {formatTime(entry.timestamp)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
