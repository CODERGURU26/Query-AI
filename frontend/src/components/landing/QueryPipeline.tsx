"use client";

import {
  MessageSquareText,
  Brain,
  Database,
  Cpu,
  Table,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { useScrollReveal } from "@/lib/useScrollReveal";

const pipelineStages = [
  {
    icon: MessageSquareText,
    label: "Natural Language",
    description: "Your question in plain English",
    color: "violet",
  },
  {
    icon: Brain,
    label: "Question Understanding",
    description: "Intent, metrics, and dimensions identified",
    color: "violet",
  },
  {
    icon: Database,
    label: "Data Context",
    description: "Schema and table relationships mapped",
    color: "cyan",
  },
  {
    icon: Cpu,
    label: "Analytics Engine",
    description: "Query generated and executed",
    color: "cyan",
  },
  {
    icon: Table,
    label: "Structured Results",
    description: "Data organized into columns and rows",
    color: "amber",
  },
  {
    icon: BarChart3,
    label: "Visualization",
    description: "Charts and graphs auto-selected",
    color: "amber",
  },
  {
    icon: Lightbulb,
    label: "Business Insight",
    description: "AI-generated summary and analysis",
    color: "emerald",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; line: string }> = {
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/20",
    line: "bg-violet-500/30",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/20",
    line: "bg-cyan-500/30",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    line: "bg-amber-500/30",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    line: "bg-emerald-500/30",
  },
};

export default function QueryPipeline() {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.05 });

  return (
    <section ref={ref} className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Query-to-insight pipeline
          </h2>
          <p className="text-zinc-400 text-base max-w-md mx-auto">
            Every question flows through a structured analytical pipeline.
          </p>
        </div>

        {/* Pipeline */}
        <div className="max-w-2xl mx-auto">
          {pipelineStages.map((stage, i) => {
            const colors = colorMap[stage.color];
            const Icon = stage.icon;
            const isLast = i === pipelineStages.length - 1;

            return (
              <div key={stage.label} className="flex flex-col items-center">
                {/* Stage */}
                <div
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                    isVisible
                      ? `opacity-100 translate-y-0 ${colors.border} ${colors.bg}`
                      : "opacity-0 translate-y-4 border-transparent bg-transparent"
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${i * 100 + 200}ms` : "0ms",
                  }}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${colors.bg} ${colors.text}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white">
                      {stage.label}
                    </h3>
                    <p className="text-xs text-zinc-500">{stage.description}</p>
                  </div>
                </div>

                {/* Connector */}
                {!isLast && (
                  <div
                    className={`w-px h-6 transition-all duration-500 ${
                      isVisible ? `${colors.line} opacity-100` : "bg-transparent opacity-0"
                    }`}
                    style={{
                      transitionDelay: isVisible
                        ? `${i * 100 + 250}ms`
                        : "0ms",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
