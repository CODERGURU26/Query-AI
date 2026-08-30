"use client";

import { Database, Sparkles, BarChart3 } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="mx-auto max-w-3xl text-center py-8">
      <p className="text-sm text-zinc-500 mb-8">
        Ask questions. Get answers. Query your e-commerce data using natural language.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <FeatureCard
          icon={Sparkles}
          title="AI-Powered SQL"
          description="Natural-language questions become safe PostgreSQL queries."
        />
        <FeatureCard
          icon={Database}
          title="Instant Insights"
          description="Clear explanations of what your data actually means."
        />
        <FeatureCard
          icon={BarChart3}
          title="Visual Analytics"
          description="Explore results through charts and intelligent tables."
        />
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
