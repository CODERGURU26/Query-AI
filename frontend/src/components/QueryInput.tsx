"use client";

import { ArrowUp, Loader2 } from "lucide-react";

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function QueryInput({
  value,
  onChange,
  onSubmit,
  loading,
}: QueryInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 shadow-2xl">
      <textarea
        id="query-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your data..."
        rows={3}
        disabled={loading}
        aria-label="Enter your data question"
        className="w-full resize-none bg-transparent px-4 py-3 text-base text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
      />

      <div className="flex items-center justify-between border-t border-white/10 px-2 pt-2">
        <span className="px-2 text-xs text-zinc-600">
          {loading
            ? "Analyzing your question…"
            : "Press Enter to ask · Shift+Enter for new line"}
        </span>

        <button
          id="submit-query"
          onClick={onSubmit}
          disabled={!value.trim() || loading}
          aria-label={loading ? "Analyzing query" : "Submit query"}
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {loading ? (
            <>
              Analyzing…
              <Loader2 size={16} className="animate-spin" />
            </>
          ) : (
            <>
              Ask QueryAI
              <ArrowUp size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
