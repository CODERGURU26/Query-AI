"use client";

import {
  ShoppingCart,
  TrendingUp,
  Truck,
  Wallet,
  Megaphone,
  BarChart3,
} from "lucide-react";
import { useScrollReveal } from "@/lib/useScrollReveal";

const useCases = [
  {
    icon: ShoppingCart,
    title: "E-Commerce",
    question: '"Which product categories generate the most revenue?"',
    description:
      "Analyze product performance, category trends, and customer purchasing patterns.",
    color: "violet",
  },
  {
    icon: TrendingUp,
    title: "Sales",
    question: '"Which regions are underperforming?"',
    description:
      "Identify regional sales gaps, track quota attainment, and surface growth opportunities.",
    color: "cyan",
  },
  {
    icon: Truck,
    title: "Operations",
    question: '"Which orders have the longest delivery time?"',
    description:
      "Monitor fulfillment efficiency, identify bottlenecks, and optimize logistics.",
    color: "amber",
  },
  {
    icon: Wallet,
    title: "Finance",
    question: '"What are our largest expense categories?"',
    description:
      "Track spending patterns, analyze cost structures, and monitor financial health.",
    color: "emerald",
  },
  {
    icon: Megaphone,
    title: "Marketing",
    question: '"Which campaigns generate the highest returns?"',
    description:
      "Measure campaign ROI, analyze channel effectiveness, and optimize spend allocation.",
    color: "rose",
  },
  {
    icon: BarChart3,
    title: "Business Intelligence",
    question: '"Give me a summary of this quarter\'s performance."',
    description:
      "Generate executive summaries, track KPIs, and surface actionable business insights.",
    color: "indigo",
  },
];

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  violet: {
    bg: "group-hover:bg-violet-500/10",
    icon: "text-violet-400",
    border: "group-hover:border-violet-500/20",
  },
  cyan: {
    bg: "group-hover:bg-cyan-500/10",
    icon: "text-cyan-400",
    border: "group-hover:border-cyan-500/20",
  },
  amber: {
    bg: "group-hover:bg-amber-500/10",
    icon: "text-amber-400",
    border: "group-hover:border-amber-500/20",
  },
  emerald: {
    bg: "group-hover:bg-emerald-500/10",
    icon: "text-emerald-400",
    border: "group-hover:border-emerald-500/20",
  },
  rose: {
    bg: "group-hover:bg-rose-500/10",
    icon: "text-rose-400",
    border: "group-hover:border-rose-500/20",
  },
  indigo: {
    bg: "group-hover:bg-indigo-500/10",
    icon: "text-indigo-400",
    border: "group-hover:border-indigo-500/20",
  },
};

export default function UseCases() {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.05 });

  return (
    <section ref={ref} id="use-cases" className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Built for every team
          </h2>
          <p className="text-zinc-400 text-base max-w-md mx-auto">
            From e-commerce to finance — QueryAI adapts to your analytical needs.
          </p>
        </div>

        {/* Use Case Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((uc, i) => {
            const colors = colorMap[uc.color];
            const Icon = uc.icon;

            return (
              <div
                key={uc.title}
                className={`group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.03] transition-all duration-500 ${colors.border} ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: isVisible ? `${i * 80 + 200}ms` : "0ms",
                }}
              >
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ${colors.bg} transition-colors mb-4`}
                >
                  <Icon size={20} className={`text-zinc-500 group-hover:${colors.icon} transition-colors ${colors.icon}`} />
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-white mb-2">
                  {uc.title}
                </h3>

                {/* Example question */}
                <p className="text-xs font-mono text-violet-300/70 mb-3 leading-relaxed">
                  {uc.question}
                </p>

                {/* Description */}
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {uc.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
