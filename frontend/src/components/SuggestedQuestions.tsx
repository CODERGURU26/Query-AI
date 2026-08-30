"use client";

import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import { formatColumnName } from "@/lib/formatting";

interface SuggestedQuestionsProps {
  response: {
    question: string;
    columns: string[];
    data: Record<string, unknown>[];
    source: "postgresql" | "csv" | "none";
    dataset_id?: string;
  } | null;
  onSelect: (question: string) => void;
  csvDataset?: {
    dataset_id: string | null;
    schema: { name: string; type: string }[];
  } | null;
}

const DEFAULT_SUGGESTIONS = [
  "Show me the total count",
  "What are the top 5 values?",
  "Show me a summary",
];

export default function SuggestedQuestions({
  response,
  onSelect,
  csvDataset,
}: SuggestedQuestionsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!response) {
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    // Generate suggestions based on data source and schema
    const generated = generateSuggestions(response, csvDataset);
    setSuggestions(generated);
    setShowSuggestions(generated.length > 0);
  }, [response, csvDataset]);

  function generateSuggestions(
    response: {
      question: string;
      columns: string[];
      data: Record<string, unknown>[];
      source: "postgresql" | "csv" | "none";
      dataset_id?: string;
    },
    csvDataset?: { dataset_id: string | null; schema: { name: string; type: string }[] } | null
  ): string[] {
    if (response.source === "csv" && csvDataset && csvDataset.schema) {
      // Generate suggestions based on CSV column names
      return generateCsvSuggestions(csvDataset.schema);
    }

    // Default suggestions based on available columns
    const { columns } = response;
    if (columns.length === 0) return [];

    // Generate 3-4 suggestions from available columns
    const suggestions: string[] = [];
    const used = new Set();

    // Add suggestions based on first few columns
    for (let i = 0; i < Math.min(columns.length, 4); i++) {
      const col = columns[i];
      if (!used.has(col)) {
        suggestions.push(`Show ${formatColumnName(col)}`);
        used.add(col);
      }
    }

    // If we need more suggestions, add generic ones
    while (suggestions.length < 4) {
      const defaultIdx = suggestions.length - DEFAULT_SUGGESTIONS.length;
      if (defaultIdx >= 0 && defaultIdx < DEFAULT_SUGGESTIONS.length) {
        suggestions.push(DEFAULT_SUGGESTIONS[defaultIdx]);
      } else {
        break;
      }
    }

    return suggestions;
  }

  function generateCsvSuggestions(
    schema: { name: string; type: string }[]
  ): string[] {
    const suggestions: string[] = [];
    const used = new Set<>();

    // Separate numeric and text columns
    const numericCols: string[] = [];
    const textCols: string[] = [];

    for (const col of schema) {
      if (col.type === "numeric" && !used.has(col.name)) {
        numericCols.push(col.name);
        used.add(col.name);
      } else if (col.type === "text" && !used.has(col.name)) {
        textCols.push(col.name);
        used.add(col.name);
      }
    }

    // Add numeric column suggestions (aggregations)
    for (const col of numericCols.slice(0, 3)) {
      suggestions.push(`Total ${formatColumnName(col)}`);
    }

    // Add text column suggestions (distinct values, groupings)
    for (const col of textCols.slice(0, 2)) {
      suggestions.push(`Which ${formatColumnName(col)}...?`);
    }

    // Add top-N suggestions for numeric columns
    if (numericCols.length > 0) {
      suggestions.push(`Top 10 ${formatColumnName(numericCols[0])}`);
    }

    // Fill up to 4 suggestions
    while (suggestions.length < 4) {
      if (suggestions.length < numericCols.length + textCols.length + 1) {
        const nextIdx = suggestions.length;
        if (nextIdx < numericCols.length) {
          suggestions.push(`Top 10 ${formatColumnName(numericCols[nextIdx])}`);
        } else {
          suggestions.push(`Show ${formatColumnName(textCols[nextIdx - numericCols.length] || "data")}`);
        }
      } else {
        break;
      }
    }

    return suggestions.slice(0, 4);
  }

  if (!showSuggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/[0.03] animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb size={18} className="text-violet-400" />
        <span className="font-medium text-sm text-zinc-300">Suggested questions</span>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => {
              // Populate the question and ask
              const trimmed = suggestion.trim();
              setQuestion(trimmed);
              // Don't automatically submit - let user edit first
              // Or auto-submit if preferred:
              // onSelect(trimmed);
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-all hover:bg-white/[0.05] hover:text-white"
            aria-label={`Suggested question: ${suggestion}`}
          >
            {Sparkles.size === 14 ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M8 8L12 12L16 8"/></svg> : <Lightbulb size={14} className="text-violet-400" />}
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}