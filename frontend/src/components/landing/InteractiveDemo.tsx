"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { MessageSquare, Sparkles } from "lucide-react";
import { demoQuestions, type DemoQuestion } from "@/lib/demo-data";
import { useScrollReveal } from "@/lib/useScrollReveal";

const CHART_COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#6366f1",
];

type DemoPhase = "idle" | "processing" | "results";

function formatDemoValue(value: number): string {
  if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("en-IN");
}

interface DemoTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function DemoTooltip({ active, payload, label }: DemoTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900/95 backdrop-blur px-3 py-2 shadow-xl">
      {label && (
        <p className="text-[10px] text-zinc-400 mb-1">{label}</p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-medium text-white">
            {formatDemoValue(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function DemoChart({ question }: { question: DemoQuestion }) {
  const { visualization, categoryKey, valueKey, data } = question;

  if (visualization === "bar") {
    return (
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
          >
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey={categoryKey}
              tick={{ fill: "#a1a1aa", fontSize: 10 }}
              angle={-25}
              textAnchor="end"
              axisLine={{ stroke: "#27272a" }}
              tickLine={false}
              tickFormatter={(v: string) =>
                v.length > 12 ? v.slice(0, 10) + "…" : v
              }
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 10 }}
              tickFormatter={(v: number) => formatDemoValue(v)}
              axisLine={{ stroke: "#27272a" }}
              tickLine={false}
            />
            <Tooltip content={<DemoTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey={valueKey} radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (visualization === "horizontal-bar") {
    return (
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#71717a", fontSize: 10 }}
              tickFormatter={(v: number) => formatDemoValue(v)}
              axisLine={{ stroke: "#27272a" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey={categoryKey}
              width={100}
              tick={{ fill: "#a1a1aa", fontSize: 10 }}
              axisLine={{ stroke: "#27272a" }}
              tickLine={false}
            />
            <Tooltip content={<DemoTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey={valueKey} radius={[0, 4, 4, 0]} maxBarSize={22}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (visualization === "pie") {
    return (
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={categoryKey}
              cx="50%"
              cy="50%"
              innerRadius="42%"
              outerRadius="75%"
              paddingAngle={3}
              stroke="#09090b"
              strokeWidth={2}
              label={({
                name,
                percent,
              }: {
                name?: string;
                percent?: number;
              }) =>
                `${String(name || "").slice(0, 10)} ${(
                  (percent || 0) * 100
                ).toFixed(0)}%`
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<DemoTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (visualization === "area") {
    return (
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <defs>
              <linearGradient id="demo-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey={categoryKey}
              tick={{ fill: "#a1a1aa", fontSize: 10 }}
              axisLine={{ stroke: "#27272a" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 10 }}
              tickFormatter={(v: number) => formatDemoValue(v)}
              axisLine={{ stroke: "#27272a" }}
              tickLine={false}
            />
            <Tooltip content={<DemoTooltip />} />
            <Area
              type="monotone"
              dataKey={valueKey}
              stroke="#8b5cf6"
              fill="url(#demo-area-grad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}

export default function InteractiveDemo() {
  const [sectionRef, sectionVisible] = useScrollReveal({ threshold: 0.05 });
  const [selectedId, setSelectedId] = useState<string>(demoQuestions[0].id);
  const [phase, setPhase] = useState<DemoPhase>("results");
  const [processingStep, setProcessingStep] = useState(0);

  const selectedQuestion = demoQuestions.find((q) => q.id === selectedId)!;

  const processingSteps = [
    "Understanding question...",
    "Analyzing data...",
    "Generating insight...",
  ];

  const handleSelectQuestion = useCallback(
    (id: string) => {
      if (id === selectedId && phase === "results") return;
      setSelectedId(id);
      setPhase("processing");
      setProcessingStep(0);
    },
    [selectedId, phase]
  );

  // Processing animation
  useEffect(() => {
    if (phase !== "processing") return;
    if (processingStep < processingSteps.length) {
      const timer = setTimeout(() => {
        setProcessingStep((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setPhase("results"), 300);
      return () => clearTimeout(timer);
    }
  }, [phase, processingStep, processingSteps.length]);

  return (
    <section
      ref={sectionRef}
      id="interactive-demo"
      className="relative py-20 md:py-28"
    >
      {/* Section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            sectionVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ask questions.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">
              Get insights.
            </span>
          </h2>
          <p className="text-zinc-400 text-base max-w-lg mx-auto">
            QueryAI transforms natural-language questions into structured analytics.
          </p>
        </div>

        {/* Demo Interface */}
        <div
          className={`grid lg:grid-cols-[320px_1fr] gap-6 transition-all duration-700 delay-200 ${
            sectionVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          {/* Question Selector */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-1">
              Select a question
            </p>
            {demoQuestions.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuestion(q.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 border ${
                  selectedId === q.id
                    ? "bg-violet-500/10 border-violet-500/30 text-white"
                    : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04] hover:border-white/10"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <MessageSquare
                    size={14}
                    className={`mt-0.5 shrink-0 ${
                      selectedId === q.id
                        ? "text-violet-400"
                        : "text-zinc-600"
                    }`}
                  />
                  <span className="leading-snug">{q.question}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Results Panel */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0f]/80 overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <MessageSquare size={12} className="text-violet-400" />
                <span className="text-xs text-violet-300 font-medium">
                  Query
                </span>
              </div>
              <span className="text-sm text-zinc-300 truncate">
                {selectedQuestion.question}
              </span>
            </div>

            <div className="p-5">
              {/* Processing state */}
              {phase === "processing" && (
                <div className="space-y-3 py-8">
                  {processingSteps.map((step, i) => (
                    <div
                      key={step}
                      className={`flex items-center gap-2.5 text-sm transition-all duration-300 ${
                        i < processingStep
                          ? "text-emerald-400"
                          : i === processingStep
                          ? "text-violet-300"
                          : "text-zinc-600"
                      }`}
                    >
                      {i < processingStep ? (
                        <span>✓</span>
                      ) : i === processingStep ? (
                        <span className="inline-block h-4 w-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                      ) : (
                        <span className="inline-block h-4 w-4 rounded-full border border-zinc-700" />
                      )}
                      {step}
                    </div>
                  ))}
                </div>
              )}

              {/* Results */}
              {phase === "results" && (
                <div className="space-y-5 landing-fade-in">
                  {/* AI Insight */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400 shrink-0 mt-0.5">
                      <Sparkles size={14} />
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {selectedQuestion.insight}
                    </p>
                  </div>

                  {/* Chart */}
                  <DemoChart question={selectedQuestion} />
                </div>
              )}

              {/* Idle */}
              {phase === "idle" && (
                <div className="py-12 text-center text-sm text-zinc-600">
                  Select a question to see the analysis
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
