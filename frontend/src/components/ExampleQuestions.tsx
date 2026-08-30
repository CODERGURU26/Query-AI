"use client";

import { useMemo } from "react";
import { formatColumnName } from "@/lib/formatting";

const DEFAULT_POSTGRES_EXAMPLES = [
  "What are the top 10 product categories by total sales?",
  "Which payment method is most popular?",
  "Which states have the most customers?",
  "Who are the top 10 sellers by sales?",
  "Which orders were delivered late?",
];

interface ExampleQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
  csvDataset?: {
    filename: string | null;
    schema: { name: string; type: string }[];
  } | null;
}

export default function ExampleQuestions({
  onSelect,
  disabled,
  csvDataset,
}: ExampleQuestionsProps) {
  const examples = useMemo(() => {
    if (!csvDataset || !csvDataset.schema || csvDataset.schema.length === 0) {
      return DEFAULT_POSTGRES_EXAMPLES;
    }

    const numericCols = csvDataset.schema
      .filter((c) => c.type === "numeric")
      .map((c) => c.name);
    const textCols = csvDataset.schema
      .filter((c) => c.type === "text" || c.type === "categorical")
      .map((c) => c.name);

    const generated: string[] = [];

    // Total metric
    if (numericCols.length > 0) {
      generated.push(`What is the total ${formatColumnName(numericCols[0])}?`);
    }

    // Top categories by metric
    if (textCols.length > 0 && numericCols.length > 0) {
      generated.push(
        `Top 10 ${formatColumnName(textCols[0])} by ${formatColumnName(numericCols[0])}`
      );
    }

    // Highest / maximum
    if (textCols.length > 0 && numericCols.length > 0) {
      generated.push(
        `Which ${formatColumnName(textCols[0])} has the highest ${formatColumnName(numericCols[0])}?`
      );
    }

    // Average
    if (numericCols.length > 0) {
      generated.push(`What is the average ${formatColumnName(numericCols[0])}?`);
    }

    // Second metric comparison
    if (numericCols.length > 1 && textCols.length > 0) {
      generated.push(
        `Show ${formatColumnName(numericCols[1])} by ${formatColumnName(textCols[0])}`
      );
    }

    // Fallback row count / summary
    generated.push("Show a summary of this dataset");

    return generated.slice(0, 5);
  }, [csvDataset]);

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {examples.map((example) => (
        <button
          key={example}
          onClick={() => onSelect(example)}
          disabled={disabled}
          className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 transition-all hover:border-violet-500/30 hover:bg-white/[0.06] hover:text-white disabled:opacity-40 disabled:pointer-events-none"
        >
          {example}
        </button>
      ))}
    </div>
  );
}
