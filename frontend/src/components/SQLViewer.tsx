"use client";

import { useState } from "react";
import { ChevronDown, Copy, Check, Code2 } from "lucide-react";

interface SQLViewerProps {
  sql: string | null;
}

export default function SQLViewer({ sql }: SQLViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!sql) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(sql!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: older browsers
      const textarea = document.createElement("textarea");
      textarea.value = sql!;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] animate-in fade-in duration-500">
      <button
        id="toggle-sql"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={isOpen}
        aria-controls="sql-content"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
            <Code2 size={14} />
          </div>
          <span className="text-sm font-semibold text-white">
            {isOpen ? "Hide SQL" : "View Generated SQL"}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div id="sql-content" className="border-t border-white/10">
          <div className="flex justify-end px-6 pt-3">
            <button
              id="copy-sql"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-white"
              aria-label="Copy SQL to clipboard"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy SQL
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto px-6 pb-6 pt-3 text-sm leading-7 text-zinc-400 font-mono">
            <code>{sql}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
