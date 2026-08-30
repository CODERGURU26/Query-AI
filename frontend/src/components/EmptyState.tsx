"use client";

import { Database, Sparkles, BarChart3, Upload } from "lucide-react";

interface EmptyStateProps {
  onUploadCsv?: () => void;
}

export default function EmptyState({ onUploadCsv }: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-3xl text-center py-6">
      <p className="text-sm text-zinc-500 mb-6">
        Ask questions in plain English to generate SQL, charts, and AI insights.
      </p>

      <div className="grid gap-4 sm:grid-cols-4">
        <FeatureCard
          icon={Sparkles}
          title="AI-Powered SQL"
          description="Questions become optimized SQL queries instantly."
        />
        <FeatureCard
          icon={Database}
          title="Instant Insights"
          description="Clear natural language explanations of results."
        />
        <FeatureCard
          icon={BarChart3}
          title="Smart Charts"
          description="Interactive Bar, Line, Pie, and Area visualizations."
        />
        <div
          onClick={onUploadCsv}
          className={`rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-5 text-left transition-all ${
            onUploadCsv ? "cursor-pointer hover:bg-violet-500/[0.08] hover:border-violet-500/40" : ""
          }`}
        >
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
            <Upload size={15} />
          </div>
          <h3 className="text-sm font-medium text-violet-200">Upload Your CSV</h3>
          <p className="mt-1.5 text-xs leading-5 text-zinc-400">
            Upload custom CSV data to query your own datasets.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 text-left">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-zinc-400">
        <Icon size={15} />
      </div>
      <h3 className="text-sm font-medium text-zinc-300">{title}</h3>
      <p className="mt-1.5 text-xs leading-5 text-zinc-600">{description}</p>
    </div>
  );
}
