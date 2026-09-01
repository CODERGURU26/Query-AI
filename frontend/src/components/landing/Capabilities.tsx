"use client";

import {
  MessageSquareText,
  FileSpreadsheet,
  Database,
  Braces,
  Code,
  BarChart3,
  LayoutDashboard,
  Table,
  Rows3,
  Sparkles,
} from "lucide-react";
import { capabilities } from "@/lib/demo-data";
import { useScrollReveal } from "@/lib/useScrollReveal";

const iconMap = {
  MessageSquareText,
  FileSpreadsheet,
  Database,
  Braces,
  Code,
  BarChart3,
  LayoutDashboard,
  Table,
  Rows3,
  Sparkles,
} as const;

export default function Capabilities() {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.05 });

  return (
    <section ref={ref} className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Product capabilities
          </h2>
          <p className="text-zinc-400 text-base max-w-md mx-auto">
            Everything you need to turn questions into insights.
          </p>
        </div>

        {/* Capability Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {capabilities.map((cap, i) => {
            const Icon = iconMap[cap.icon];

            return (
              <div
                key={cap.title}
                className={`group p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDelay: isVisible ? `${i * 50 + 200}ms` : "0ms",
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/[0.08] text-violet-400 group-hover:bg-violet-500/15 transition-colors mb-3">
                  <Icon size={16} />
                </div>
                <h3 className="text-xs font-semibold text-white mb-1">
                  {cap.title}
                </h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  {cap.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
