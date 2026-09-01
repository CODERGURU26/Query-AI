"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Sparkles, Search } from "lucide-react";
import { heroDemoData } from "@/lib/demo-data";

type Phase = "idle" | "typing" | "processing" | "results";

const CHART_COLORS = ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"];

export default function HeroDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [typedText, setTypedText] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const [showChart, setShowChart] = useState(false);

  const startDemo = useCallback(() => {
    setPhase("typing");
    setTypedText("");
    setProcessingStep(0);
    setShowChart(false);
  }, []);

  // Auto-start after mount
  useEffect(() => {
    const timer = setTimeout(startDemo, 1200);
    return () => clearTimeout(timer);
  }, [startDemo]);

  // Typing animation
  useEffect(() => {
    if (phase !== "typing") return;
    const fullText = heroDemoData.question;
    if (typedText.length < fullText.length) {
      const timer = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 30);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setPhase("processing"), 400);
      return () => clearTimeout(timer);
    }
  }, [phase, typedText]);

  // Processing steps animation
  useEffect(() => {
    if (phase !== "processing") return;
    if (processingStep < heroDemoData.processingSteps.length) {
      const timer = setTimeout(() => {
        setProcessingStep((prev) => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setPhase("results");
        setTimeout(() => setShowChart(true), 300);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [phase, processingStep]);

  // Restart loop
  useEffect(() => {
    if (phase !== "results") return;
    const timer = setTimeout(() => {
      startDemo();
    }, 6000);
    return () => clearTimeout(timer);
  }, [phase, startDemo]);

  return (
    <div className="relative">
      {/* Glow effect behind card */}
      <div
        className="absolute -inset-4 bg-violet-500/[0.06] rounded-3xl blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Main card */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c0c0f]/90 backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
          <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="ml-3 text-[10px] text-zinc-500 font-mono">
            QueryAI Analytics
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Query Input */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5">
            <Search size={14} className="text-zinc-500 shrink-0" />
            <span className="text-sm text-zinc-300 font-mono truncate">
              {phase === "idle"
                ? "Ask a question..."
                : typedText}
              {(phase === "typing") && (
                <span className="inline-block w-px h-4 bg-violet-400 ml-0.5 animate-pulse align-middle" />
              )}
            </span>
          </div>

          {/* Processing Steps */}
          {phase === "processing" && (
            <div className="space-y-2 px-1">
              {heroDemoData.processingSteps.map((step, i) => (
                <div
                  key={step}
                  className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                    i < processingStep
                      ? "text-emerald-400 opacity-100"
                      : i === processingStep
                      ? "text-violet-300 opacity-100"
                      : "text-zinc-600 opacity-40"
                  }`}
                >
                  {i < processingStep ? (
                    <span className="text-emerald-400">✓</span>
                  ) : i === processingStep ? (
                    <span className="inline-block h-3 w-3 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                  ) : (
                    <span className="inline-block h-3 w-3 rounded-full border border-zinc-700" />
                  )}
                  {step}
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {phase === "results" && (
            <div className="space-y-3 landing-fade-in">
              {/* Section label */}
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-violet-400" />
                <span className="text-[10px] font-semibold text-violet-300 uppercase tracking-wider">
                  Top Product Categories
                </span>
              </div>

              {/* Results table */}
              <div className="space-y-1">
                {heroDemoData.results.map((row, i) => (
                  <div
                    key={row.category}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                    style={{
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    <span className="text-xs text-zinc-300">
                      {row.category}
                    </span>
                    <span className="text-xs font-semibold text-white font-mono">
                      {row.sales}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mini chart */}
              {showChart && (
                <div className="h-[100px] w-full landing-fade-in">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={heroDemoData.chartData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#52525b", fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: string) =>
                          v.length > 6 ? v.slice(0, 5) + "…" : v
                        }
                      />
                      <YAxis hide />
                      <Bar
                        dataKey="value"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={28}
                      >
                        {heroDemoData.chartData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Idle state */}
          {phase === "idle" && (
            <div className="py-6 text-center text-xs text-zinc-600">
              Loading analytics...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
