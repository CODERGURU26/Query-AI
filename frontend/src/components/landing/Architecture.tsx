"use client";

import {
  Monitor,
  Server,
  Database,
  FileSpreadsheet,
  Cpu,
  Brain,
  BarChart3,
  ArrowDown,
} from "lucide-react";
import { useScrollReveal } from "@/lib/useScrollReveal";

const archLayers = [
  {
    icon: Monitor,
    label: "User Interface",
    tech: "Next.js + React",
    color: "violet",
    description: "Interactive analytics dashboard",
  },
  {
    icon: Server,
    label: "API Layer",
    tech: "FastAPI",
    color: "cyan",
    description: "High-performance Python backend",
  },
  {
    icon: null,
    label: "Data Sources",
    items: [
      { icon: Database, label: "PostgreSQL", color: "emerald" },
      { icon: FileSpreadsheet, label: "CSV / Pandas", color: "amber" },
    ],
  },
  {
    icon: Cpu,
    label: "Query Engine",
    tech: "SQLAlchemy + Pandas",
    color: "cyan",
    description: "SQL generation and data processing",
  },
  {
    icon: Brain,
    label: "AI / LLM Layer",
    tech: "OpenRouter + Gemma",
    color: "violet",
    description: "Natural language understanding",
  },
  {
    icon: BarChart3,
    label: "Analytics + Insights",
    tech: "Recharts + AI Summaries",
    color: "emerald",
    description: "Visualizations and business insights",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/20",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
};

export default function Architecture() {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.05 });

  return (
    <section ref={ref} id="architecture" className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Technical architecture
          </h2>
          <p className="text-zinc-400 text-base max-w-md mx-auto">
            Built on proven technologies for reliability and performance.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="max-w-xl mx-auto">
          {archLayers.map((layer, i) => {
            const isLast = i === archLayers.length - 1;

            // Data sources split view
            if (layer.items) {
              return (
                <div key={layer.label} className="flex flex-col items-center">
                  <div
                    className={`w-full grid grid-cols-2 gap-3 transition-all duration-500 ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                    style={{
                      transitionDelay: isVisible ? `${i * 120 + 200}ms` : "0ms",
                    }}
                  >
                    {layer.items.map((item) => {
                      const colors = colorMap[item.color];
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={`flex items-center gap-3 p-4 rounded-xl border ${colors.border} ${colors.bg}`}
                        >
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors.bg} ${colors.text} shrink-0`}
                          >
                            <Icon size={18} />
                          </div>
                          <span className="text-sm font-medium text-white">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {!isLast && (
                    <div className="flex flex-col items-center my-2">
                      <div className="w-px h-3 bg-white/10" />
                      <ArrowDown size={12} className="text-zinc-600" />
                      <div className="w-px h-3 bg-white/10" />
                    </div>
                  )}
                </div>
              );
            }

            const colors = colorMap[layer.color!];
            const Icon = layer.icon!;

            return (
              <div key={layer.label} className="flex flex-col items-center">
                <div
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                    isVisible
                      ? `opacity-100 translate-y-0 ${colors.border} ${colors.bg}`
                      : "opacity-0 translate-y-4 border-transparent"
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${i * 120 + 200}ms` : "0ms",
                  }}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${colors.bg} ${colors.text}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white">
                        {layer.label}
                      </h3>
                      <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-white/[0.03]">
                        {layer.tech}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {layer.description}
                    </p>
                  </div>
                </div>

                {!isLast && (
                  <div className="flex flex-col items-center my-2">
                    <div className="w-px h-3 bg-white/10" />
                    <ArrowDown size={12} className="text-zinc-600" />
                    <div className="w-px h-3 bg-white/10" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
