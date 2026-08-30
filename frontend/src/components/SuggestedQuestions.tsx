"use client";

import { useState, useEffect } from "react";
import { Lightbulb, Sparkles } from "lucide-react";
import { formatColumnName } from "@/lib/formatting";
import type { QueryResponse } from "@/types/query";

interface SuggestedQuestionsProps {
  response: QueryResponse | null;
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
    response: QueryResponse,
    csvDataset?: { dataset_id: string | null; schema: { name: string; type: string }[] } | null
  ): string[] {
    if (response.source === "csv" && csvDataset && csvDataset.schema) {
      return generateCsvSuggestions(csvDataset.schema);
    }

    const { columns } = response;
    if (columns.length === 0) return [];

    const suggestions: string[] = [];
    const used = new Set<string>();

    for (let i = 0; i < Math.min(columns.length, 4); i++) {
      const col = columns[i];
      if (!used.has(col)) {
        suggestions.push(`Show ${formatColumnName(col)}`);
        used.add(col);
      }
    }

    let defaultIdx = 0;
    while (suggestions.length < 4 && defaultIdx < DEFAULT_SUGGESTIONS.length) {
      suggestions.push(DEFAULT_SUGGESTIONS[defaultIdx]);
      defaultIdx++;
    }

    return suggestions;
  }

  function generateCsvSuggestions(
    schema: { name: string; type: string }[]
  ): string[] {
    const suggestions: string[] = [];
    const used = new Set<string>();

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

    for (const col of numericCols.slice(0, 3)) {
      suggestions.push(`Total ${formatColumnName(col)}`);
    }

    for (const col of textCols.slice(0, 2)) {
      suggestions.push(`Which ${formatColumnName(col)}...?`);
    }

    if (numericCols.length > 0) {
      suggestions.push(`Top 10 ${formatColumnName(numericCols[0])}`);
    }

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
            onClick={() => onSelect(suggestion.trim())}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-all hover:bg-white/[0.05] hover:text-white"
            aria-label={`Suggested question: ${suggestion}`}
          >
            <Sparkles size={14} className="text-violet-400" />
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}