"use client";

import { useState, useEffect } from "react";
import { MessageSquareText, Brain, BarChart3, Lightbulb } from "lucide-react";
import { useScrollReveal } from "@/lib/useScrollReveal";

const steps = [
  {
    number: "01",
    title: "Ask",
    description: "Ask a question in natural language.",
    example: '"Which region generated the most revenue?"',
    icon: MessageSquareText,
    color: "violet",
  },
  {
    number: "02",
    title: "Understand",
    description:
      "QueryAI identifies the intent, metrics, dimensions, and relevant data.",
    example: "Intent: aggregate · Metric: revenue · Dimension: region",
    icon: Brain,
    color: "cyan",
  },
  {
    number: "03",
    title: "Analyze",
    description:
      "The system processes the underlying data and generates the appropriate analytical query.",
    example: "SELECT region, SUM(revenue) ... GROUP BY region",
    icon: BarChart3,
    color: "amber",
  },
  {
    number: "04",
    title: "Insight",
    description:
      "Receive structured results, visualizations, and business insights.",
    example: "Maharashtra leads with ₹18.2M in revenue",
    icon: Lightbulb,
    color: "emerald",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
    glow: "shadow-violet-500/10",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/10",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    glow: "shadow-amber-500/10",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/10",
  },
};

export default function HowItWorks() {
  const [sectionRef, sectionVisible] = useScrollReveal({ threshold: 0.05 });
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycle through steps
  useEffect(() => {
    if (!sectionVisible) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sectionVisible]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative py-20 md:py-28"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            sectionVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How QueryAI works
          </h2>
          <p className="text-zinc-400 text-base max-w-md mx-auto">
            From question to insight in four simple steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => {
            const colors = colorMap[step.color];
            const isActive = activeStep === i;
            const Icon = step.icon;

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(i)}
                className={`group relative text-left p-6 rounded-2xl border transition-all duration-500 ${
                  isActive
                    ? `${colors.border} ${colors.bg} shadow-lg ${colors.glow}`
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                } ${
                  sectionVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: sectionVisible ? `${i * 100 + 200}ms` : "0ms",
                }}
              >
                {/* Step number */}
                <span
                  className={`text-xs font-mono font-bold tracking-wider mb-4 block ${
                    isActive ? colors.text : "text-zinc-600"
                  }`}
                >
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl mb-4 transition-colors ${
                    isActive
                      ? `${colors.bg} ${colors.text}`
                      : "bg-white/[0.04] text-zinc-500"
                  }`}
                >
                  <Icon size={20} />
                </div>

                {/* Content */}
                <h3 className="text-base font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                  {step.description}
                </p>

                {/* Example */}
                <div
                  className={`text-xs font-mono px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? `${colors.bg} ${colors.text}`
                      : "bg-white/[0.02] text-zinc-500"
                  }`}
                >
                  {step.example}
                </div>

                {/* Connector line (desktop) */}
                {i < steps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-white/[0.08]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
