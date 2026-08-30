"use client";

import { useEffect, useState } from "react";
import { Database, BrainCircuit, Search, BarChart3 } from "lucide-react";

const STEPS = [
  { label: "Analyzing your question", icon: BrainCircuit, delay: 0 },
  { label: "Generating SQL", icon: Database, delay: 800 },
  { label: "Querying database", icon: Search, delay: 2000 },
  { label: "Preparing insights", icon: BarChart3, delay: 3500 },
];

export default function LoadingState() {
  const [visibleSteps, setVisibleSteps] = useState(1);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, index) => {
      if (index === 0) return; // First step is always visible
      const timer = setTimeout(() => {
        setVisibleSteps(index + 1);
      }, step.delay);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isVisible = index < visibleSteps;
          const isActive = index === visibleSteps - 1;

          return (
            <div
              key={step.label}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-500 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0"
              } ${
                isActive
                  ? "bg-white/[0.05] border border-white/10"
                  : "opacity-60"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                  isActive ? "bg-violet-500/20 text-violet-400" : "text-zinc-500"
                }`}
              >
                <Icon size={16} />
              </div>
              <span
                className={`text-sm transition-colors duration-300 ${
                  isActive ? "text-white font-medium" : "text-zinc-500"
                }`}
              >
                {step.label}
              </span>
              {isActive && (
                <div className="ml-auto flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse [animation-delay:300ms]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
