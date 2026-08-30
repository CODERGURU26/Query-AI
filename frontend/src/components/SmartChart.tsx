"use client";

import { useMemo } from "react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { detectChartType } from "@/lib/chartDetection";
import { formatNumber, formatColumnName, formatAxisValue } from "@/lib/formatting";
import type { ChartConfig } from "@/types/query";

interface SmartChartProps {
  columns: string[];
  data: Record<string, unknown>[];
}

// Carefully chosen palette for dark backgrounds — all visible
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
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 shadow-xl">
      {label && (
        <p className="mb-2 text-xs font-medium text-zinc-400">
          {String(label).replace(/_/g, " ")}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-400">
            {formatColumnName(entry.name)}:
          </span>
          <span className="font-medium text-white">
            {formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SmartChart({ columns, data }: SmartChartProps) {
  const chartConfig = useMemo(
    () => detectChartType(columns, data),
    [columns, data]
  );

  if (!chartConfig || data.length < 2) return null;

  const chartTitle = buildTitle(chartConfig);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 animate-in fade-in duration-500">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
          <BarChart3 size={14} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Visualization</h3>
          <p className="text-xs text-zinc-500">{chartTitle}</p>
        </div>
      </div>

      <div className="h-[400px] w-full">
        {chartConfig.type === "horizontal-bar" && (
          <HorizontalBarChart data={data} config={chartConfig} />
        )}
        {chartConfig.type === "bar" && (
          <VerticalBarChart data={data} config={chartConfig} />
        )}
        {chartConfig.type === "grouped-bar" && (
          <GroupedBarChart data={data} config={chartConfig} />
        )}
        {chartConfig.type === "line" && (
          <TimeLineChart data={data} config={chartConfig} />
        )}
        {chartConfig.type === "pie" && (
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
  const dynamicHeight = Math.max(400, data.length * 40);
  return (
    <div style={{ height: dynamicHeight }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickFormatter={formatAxisValue}
            axisLine={{ stroke: "#27272a" }}
          />
          <YAxis
            type="category"
            dataKey={config.categoryKey}
            width={160}
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            tickFormatter={(v: string) =>
              v.length > 22 ? v.replace(/_/g, " ").slice(0, 20) + "…" : v.replace(/_/g, " ")
            }
            axisLine={{ stroke: "#27272a" }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar
            dataKey={config.valueKeys[0]}
            fill={CHART_COLORS[0]}
            radius={[0, 4, 4, 0]}
            maxBarSize={32}
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
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={config.categoryKey}
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
          angle={-35}
          textAnchor="end"
          tickFormatter={(v: string) =>
            v.length > 16 ? v.replace(/_/g, " ").slice(0, 14) + "…" : v.replace(/_/g, " ")
          }
          axisLine={{ stroke: "#27272a" }}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 12 }}
          tickFormatter={formatAxisValue}
          axisLine={{ stroke: "#27272a" }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar
          dataKey={config.valueKeys[0]}
          fill={CHART_COLORS[0]}
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function GroupedBarChart({
  data,
  config,
}: {
  data: Record<string, unknown>[];
  config: ChartConfig;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={config.categoryKey}
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
          angle={-35}
          textAnchor="end"
          tickFormatter={(v: string) => v.replace(/_/g, " ")}
          axisLine={{ stroke: "#27272a" }}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 12 }}
          tickFormatter={formatAxisValue}
          axisLine={{ stroke: "#27272a" }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        {config.valueKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
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
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
        <XAxis
          dataKey={config.categoryKey}
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
          axisLine={{ stroke: "#27272a" }}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 12 }}
          tickFormatter={formatAxisValue}
          axisLine={{ stroke: "#27272a" }}
        />
        <Tooltip content={<ChartTooltip />} />
        {config.valueKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS[i % CHART_COLORS.length], r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={config.categoryKey}
          cx="50%"
          cy="50%"
          innerRadius="45%"
          outerRadius="75%"
          paddingAngle={2}
          stroke="none"
          label={({ name, percent }: { name?: string; percent?: number }) =>
            `${String(name || "").replace(/_/g, " ")} (${((percent || 0) * 100).toFixed(0)}%)`
          }
        >
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function buildTitle(config: ChartConfig): string {
  const category = formatColumnName(config.categoryKey);
  const values = config.valueKeys.map(formatColumnName).join(", ");
  return `${values} by ${category}`;
}
