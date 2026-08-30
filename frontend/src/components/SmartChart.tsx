"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart3,
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import { detectChartType } from "@/lib/chartDetection";
import { formatNumber, formatColumnName, formatAxisValue } from "@/lib/formatting";
import type { ChartConfig, ChartType } from "@/types/query";

interface SmartChartProps {
  columns: string[];
  data: Record<string, unknown>[];
}

const CHART_COLORS = [
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#10b981", // emerald
  "#f43f5e", // rose
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#e879f9", // fuchsia
  "#fb923c", // orange
  "#38bdf8", // sky
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur px-4 py-3 shadow-2xl">
      {label && (
        <p className="mb-2 text-xs font-medium text-zinc-400">
          {String(label).replace(/_/g, " ")}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-400">
            {formatColumnName(entry.name)}:
          </span>
          <span className="font-semibold text-white">
            {typeof entry.value === "number" ? formatNumber(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SmartChart({ columns, data }: SmartChartProps) {
  const autoConfig = useMemo(
    () => detectChartType(columns, data),
    [columns, data]
  );

  const [activeType, setActiveType] = useState<ChartType | null>(null);

  // Sync activeType when new data arrives
  useEffect(() => {
    if (autoConfig) {
      setActiveType(autoConfig.type);
    }
  }, [autoConfig]);

  if (!autoConfig || data.length < 2) return null;

  const currentType = activeType || autoConfig.type;
  const chartConfig: ChartConfig = {
    ...autoConfig,
    type: currentType,
  };

  const chartTitle = buildTitle(chartConfig);

  const isMultiMetric = chartConfig.valueKeys.length > 1;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 animate-in fade-in duration-500">
      {/* Header with Title & Chart Type Switcher */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Visualization</h3>
            <p className="text-xs text-zinc-500">{chartTitle}</p>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveType("bar")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              currentType === "bar" || currentType === "grouped-bar"
                ? "bg-violet-500/20 text-violet-300 shadow-sm border border-violet-500/30"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
            title="Vertical Bar Chart"
          >
            <BarChart3 size={13} />
            <span>Bar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType("horizontal-bar")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              currentType === "horizontal-bar"
                ? "bg-violet-500/20 text-violet-300 shadow-sm border border-violet-500/30"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
            title="Horizontal Bar Chart"
          >
            <BarChart2 size={13} className="rotate-90" />
            <span>Horizontal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType("line")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              currentType === "line"
                ? "bg-violet-500/20 text-violet-300 shadow-sm border border-violet-500/30"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
            title="Line Trend Chart"
          >
            <LineChartIcon size={13} />
            <span>Line</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType("area")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              currentType === "area"
                ? "bg-violet-500/20 text-violet-300 shadow-sm border border-violet-500/30"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
            title="Area Chart"
          >
            <Activity size={13} />
            <span>Area</span>
          </button>

          {!isMultiMetric && (
            <button
              type="button"
              onClick={() => setActiveType("pie")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                currentType === "pie"
                  ? "bg-violet-500/20 text-violet-300 shadow-sm border border-violet-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
              title="Donut / Pie Chart"
            >
              <PieChartIcon size={13} />
              <span>Pie</span>
            </button>
          )}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full">
        {currentType === "horizontal-bar" && (
          <HorizontalBarChart data={data} config={chartConfig} />
        )}
        {currentType === "bar" && !isMultiMetric && (
          <VerticalBarChart data={data} config={chartConfig} />
        )}
        {(currentType === "grouped-bar" || (currentType === "bar" && isMultiMetric)) && (
          <GroupedBarChart data={data} config={chartConfig} />
        )}
        {currentType === "line" && (
          <TimeLineChart data={data} config={chartConfig} />
        )}
        {currentType === "area" && (
          <SmoothAreaChart data={data} config={chartConfig} />
        )}
        {currentType === "pie" && (
          <DonutChart data={data} config={chartConfig} />
        )}
      </div>
    </div>
  );
}

function HorizontalBarChart({
  data,
  config,
}: {
  data: Record<string, unknown>[];
  config: ChartConfig;
}) {
  // Bounded height with internal scroll for very long lists
  const dynamicHeight = Math.min(500, Math.max(320, data.length * 30));
  const isScrollable = data.length > 15;

  return (
    <div
      style={{ height: dynamicHeight }}
      className={`w-full ${isScrollable ? "overflow-y-auto pr-2" : ""}`}
    >
      <ResponsiveContainer width="100%" height={isScrollable ? data.length * 28 : "100%"}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickFormatter={formatAxisValue}
            axisLine={{ stroke: "#27272a" }}
          />
          <YAxis
            type="category"
            dataKey={config.categoryKey}
            width={130}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            tickFormatter={(v: string) => {
              const str = String(v ?? "").replace(/_/g, " ");
              return str.length > 18 ? str.slice(0, 16) + "…" : str;
            }}
            axisLine={{ stroke: "#27272a" }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar
            dataKey={config.valueKeys[0]}
            fill={CHART_COLORS[0]}
            radius={[0, 4, 4, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function VerticalBarChart({
  data,
  config,
}: {
  data: Record<string, unknown>[];
  config: ChartConfig;
}) {
  // If too many items for a vertical chart, show top 15
  const chartData = data.length > 15 ? data.slice(0, 15) : data;

  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 55 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={config.categoryKey}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            angle={-30}
            textAnchor="end"
            interval={0}
            tickFormatter={(v: string) => {
              const str = String(v ?? "").replace(/_/g, " ");
              return str.length > 14 ? str.slice(0, 12) + "…" : str;
            }}
            axisLine={{ stroke: "#27272a" }}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickFormatter={formatAxisValue}
            axisLine={{ stroke: "#27272a" }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar
            dataKey={config.valueKeys[0]}
            fill={CHART_COLORS[0]}
            radius={[4, 4, 0, 0]}
            maxBarSize={44}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function GroupedBarChart({
  data,
  config,
}: {
  data: Record<string, unknown>[];
  config: ChartConfig;
}) {
  const chartData = data.length > 15 ? data.slice(0, 15) : data;

  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 55 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={config.categoryKey}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            angle={-30}
            textAnchor="end"
            tickFormatter={(v: string) => String(v ?? "").replace(/_/g, " ")}
            axisLine={{ stroke: "#27272a" }}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickFormatter={formatAxisValue}
            axisLine={{ stroke: "#27272a" }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Legend
            wrapperStyle={{ paddingTop: "10px" }}
            formatter={(val) => <span className="text-xs text-zinc-400">{formatColumnName(val)}</span>}
          />
          {config.valueKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TimeLineChart({
  data,
  config,
}: {
  data: Record<string, unknown>[];
  config: ChartConfig;
}) {
  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 15, right: 20, left: 10, bottom: 35 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
          <XAxis
            dataKey={config.categoryKey}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            tickFormatter={(v: string) => String(v ?? "").replace(/_/g, " ")}
            axisLine={{ stroke: "#27272a" }}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickFormatter={formatAxisValue}
            axisLine={{ stroke: "#27272a" }}
          />
          <Tooltip content={<ChartTooltip />} />
          {config.valueKeys.length > 1 && (
            <Legend
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(val) => <span className="text-xs text-zinc-400">{formatColumnName(val)}</span>}
            />
          )}
          {config.valueKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2.5}
              dot={{ fill: CHART_COLORS[i % CHART_COLORS.length], r: 3 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SmoothAreaChart({
  data,
  config,
}: {
  data: Record<string, unknown>[];
  config: ChartConfig;
}) {
  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 20, left: 10, bottom: 35 }}>
          <defs>
            {config.valueKeys.map((key, i) => (
              <linearGradient key={`grad-${key}`} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.4} />
                <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
          <XAxis
            dataKey={config.categoryKey}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            tickFormatter={(v: string) => String(v ?? "").replace(/_/g, " ")}
            axisLine={{ stroke: "#27272a" }}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickFormatter={formatAxisValue}
            axisLine={{ stroke: "#27272a" }}
          />
          <Tooltip content={<ChartTooltip />} />
          {config.valueKeys.length > 1 && (
            <Legend
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(val) => <span className="text-xs text-zinc-400">{formatColumnName(val)}</span>}
            />
          )}
          {config.valueKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              fillOpacity={1}
              fill={`url(#grad-${i})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DonutChart({
  data,
  config,
}: {
  data: Record<string, unknown>[];
  config: ChartConfig;
}) {
  const valueKey = config.valueKeys[0];
  // Limit to top 6 categories + Other if needed
  const chartData = useMemo(() => {
    if (data.length <= 7) return data;
    const top6 = data.slice(0, 6);
    const otherSum = data.slice(6).reduce((acc, r) => {
      const val = r[valueKey];
      return acc + (typeof val === "number" ? val : 0);
    }, 0);
    return [
      ...top6,
      {
        [config.categoryKey]: "Other",
        [valueKey]: otherSum,
      },
    ];
  }, [data, config.categoryKey, valueKey]);

  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey={valueKey}
            nameKey={config.categoryKey}
            cx="50%"
            cy="50%"
            innerRadius="48%"
            outerRadius="78%"
            paddingAngle={3}
            stroke="#09090b"
            strokeWidth={2}
            label={({ name, percent }: { name?: string; percent?: number }) =>
              `${String(name || "").replace(/_/g, " ")} (${((percent || 0) * 100).toFixed(0)}%)`
            }
          >
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function buildTitle(config: ChartConfig): string {
  const category = formatColumnName(config.categoryKey);
  const values = config.valueKeys.map(formatColumnName).join(", ");
  return `${values} by ${category}`;
}
