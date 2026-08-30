"use client";

const EXAMPLES = [
  "What are the top 10 product categories by total sales?",
  "Which payment method is most popular?",
  "Which states have the most customers?",
  "Who are the top 10 sellers by sales?",
  "Which orders were delivered late?",
];

interface ExampleQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export default function ExampleQuestions({
  onSelect,
  disabled,
}: ExampleQuestionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {EXAMPLES.map((example) => (
        <button
          key={example}
          onClick={() => onSelect(example)}
          disabled={disabled}
          className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:opacity-40 disabled:pointer-events-none"
        >
          {example}
        </button>
      ))}
    </div>
  );
}
