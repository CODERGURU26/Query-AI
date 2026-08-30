"use client";

import { TrendingUp, Hash, Award } from "lucide-react";
import {
  formatCompactNumber,
  formatNumber,
  isCurrencyColumn,
} from "@/lib/formatting";

interface KPICardsProps {
  columns: string[];
  data: Record<string, unknown>[];
}

interface KPIMetric {
  label: string;
  value: string;
  icon: typeof TrendingUp;
}

export default function KPICards({ columns, data }: KPICardsProps) {
  const metrics = deriveMetrics(columns, data);

  if (metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 animate-in fade-in duration-500">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-center gap-2 text-zinc-500">
              <Icon size={14} />
              <span className="text-xs font-medium uppercase tracking-wider">
                {metric.label}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold text-white truncate" title={metric.value}>
              {metric.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function deriveMetrics(
  columns: string[],
  data: Record<string, unknown>[]
): KPIMetric[] {
  if (!data || data.length === 0) return [];

  const metrics: KPIMetric[] = [];

  // Find numeric and categorical columns
  const numericCols = columns.filter(
    (col) => typeof data[0][col] === "number"
  );
  const categoricalCols = columns.filter(
    (col) => typeof data[0][col] === "string"
  );

  // Metric: Total/sum of the primary numeric column
  if (numericCols.length > 0) {
    const primaryNumCol = numericCols[0];
    const sum = data.reduce((acc, row) => {
      const val = row[primaryNumCol];
      return acc + (typeof val === "number" ? val : 0);
    }, 0);

    const label = formatMetricLabel(primaryNumCol);
    const isCurrency = isCurrencyColumn(primaryNumCol);

    metrics.push({
      label: `Total ${label}`,
      value: isCurrency
        ? `$${formatCompactNumber(sum)}`
        : formatCompactNumber(sum),
      icon: TrendingUp,
    });
  }

  // Metric: Top category (first row, first categorical column)
  if (categoricalCols.length > 0 && data.length > 1) {
    const topVal = data[0][categoricalCols[0]];
    if (typeof topVal === "string") {
      metrics.push({
        label: `Top ${formatMetricLabel(categoricalCols[0])}`,
        value: topVal.replace(/_/g, " "),
        icon: Award,
      });
    }
  }

  // Metric: Row count
  metrics.push({
    label: "Results",
    value: formatNumber(data.length),
    icon: Hash,
  });

  return metrics;
}

function formatMetricLabel(column: string): string {
  return column
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    // Shorten common patterns
    .replace(/Product Category Name/i, "Category")
    .replace(/Category Name/i, "Category")
    .replace(/Total Sales/i, "Sales")
    .replace(/Customer State/i, "State");
}