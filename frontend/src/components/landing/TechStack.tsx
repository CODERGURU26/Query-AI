"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";
import { techStack } from "@/lib/demo-data";

const categories = [
  { key: "frontend" as const, label: "Frontend", color: "violet" },
  { key: "backend" as const, label: "Backend", color: "cyan" },
  { key: "data" as const, label: "Data", color: "emerald" },
  { key: "ai" as const, label: "AI", color: "amber" },
];

const colorMap: Record<string, { dot: string; bg: string; border: string }> = {
  violet: {
    dot: "bg-violet-400",
    bg: "bg-violet-500/[0.06]",
    border: "border-violet-500/15",
  },
  cyan: {
    dot: "bg-cyan-400",
    bg: "bg-cyan-500/[0.06]",
    border: "border-cyan-500/15",
  },
  emerald: {
    dot: "bg-emerald-400",
    bg: "bg-emerald-500/[0.06]",
    border: "border-emerald-500/15",
  },
  amber: {
    dot: "bg-amber-400",
    bg: "bg-amber-500/[0.06]",
    border: "border-amber-500/15",
  },
};

export default function TechStack() {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });

  return (
    <section ref={ref} id="technology" className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Technology stack
          </h2>
          <p className="text-zinc-400 text-base max-w-md mx-auto">
            Built with modern, production-grade technologies.
          </p>
        </div>

        {/* Tech Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {categories.map((cat, ci) => {
            const colors = colorMap[cat.color];
            const items = techStack[cat.key];

            return (
              <div
                key={cat.key}
                className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: isVisible ? `${ci * 100 + 200}ms` : "0ms",
                }}
              >
                {/* Category header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`h-2 w-2 rounded-full ${colors.dot}`} />
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {cat.label}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2.5">
                  {items.map((item) => (
                    <div
                      key={item.name}
                      className={`px-3 py-2.5 rounded-xl border ${colors.border} ${colors.bg}`}
                    >
                      <span className="text-sm font-medium text-white block">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {item.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
