import type { ChartConfig } from "@/types/query";

function isNumeric(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isDateLike(value: unknown): boolean {
  if (typeof value !== "string") return false;
  // Match common date/datetime patterns
  return /^\d{4}-\d{2}-\d{2}/.test(value) || !isNaN(Date.parse(value));
}

function isDateColumn(columnName: string): boolean {
  const datePatterns = /date|time|timestamp|created|updated|month|year|day|week|period/i;
  return datePatterns.test(columnName);
}

function isRankingQuery(columnName: string): boolean {
  const rankingPatterns = /top|rank|best|worst|highest|lowest/i;
  return rankingPatterns.test(columnName);
}

/**
 * Detect the best chart type for the given data.
 * Returns null if no appropriate chart can be determined.
 */
export function detectChartType(
  columns: string[],
  data: Record<string, unknown>[]
): ChartConfig | null {
  if (!data || data.length === 0 || columns.length < 2) {
    return null;
  }

  const firstRow = data[0];

  // Classify columns
  const numericCols: string[] = [];
  const categoricalCols: string[] = [];
  const dateCols: string[] = [];

  for (const col of columns) {
    const val = firstRow[col];
    if (isNumeric(val)) {
      numericCols.push(col);
    } else if (isDateColumn(col) || isDateLike(val)) {
      dateCols.push(col);
    } else if (typeof val === "string") {
      categoricalCols.push(col);
    }
  }

  // Date + numeric → line chart
  if (dateCols.length >= 1 && numericCols.length >= 1) {
    return {
      type: "line",
      categoryKey: dateCols[0],
      valueKeys: numericCols,
      dateKey: dateCols[0],
    };
  }

  // 1 categorical + multiple numeric → grouped bar
  if (categoricalCols.length === 1 && numericCols.length > 1) {
    return {
      type: "grouped-bar",
      categoryKey: categoricalCols[0],
      valueKeys: numericCols,
    };
  }

  // 1 categorical + 1 numeric
  if (categoricalCols.length >= 1 && numericCols.length >= 1) {
    const categoryKey = categoricalCols[0];
    const valueKey = numericCols[0];

    // Small number of categories → pie chart
    if (data.length <= 6 && data.length >= 2) {
      return {
        type: "pie",
        categoryKey,
        valueKeys: [valueKey],
      };
    }

    // Ranking-style or many categories → horizontal bar
    if (data.length > 6 || isRankingQuery(categoryKey)) {
      return {
        type: "horizontal-bar",
        categoryKey,
        valueKeys: [valueKey],
      };
    }

    // Default categorical → bar chart
    return {
      type: "bar",
      categoryKey,
      valueKeys: [valueKey],
    };
  }

  return null;
}
