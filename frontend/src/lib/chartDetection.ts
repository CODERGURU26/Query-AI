import type { ChartConfig } from "@/types/query";

function isNumeric(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isDateLike(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  const str = String(value).trim();
  // Match YYYY-MM-DD, YYYY-MM, YYYY/MM/DD, timestamps
  if (/^\d{4}[-/]\d{1,2}(?:[-/]\d{1,2})?/.test(str)) return true;
  // Match month names like Jan, January, Feb, etc.
  if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*$/i.test(str)) return true;
  // Match 4-digit years like 2016, 2017, 2018
  if (/^(19|20)\d{2}$/.test(str)) return true;
  // Match standard parseable dates
  if (isNaN(Number(str)) && !isNaN(Date.parse(str))) return true;
  return false;
}

function isDateColumn(columnName: string): boolean {
  const datePatterns = /date|time|timestamp|created|updated|month|year|day|week|quarter|period|hour/i;
  return datePatterns.test(columnName);
}

function isDistributionColumn(columnName: string): boolean {
  const distributionPatterns = /status|type|method|category|score|gender|tier|priority|rating/i;
  return distributionPatterns.test(columnName);
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

  const sampleRows = data.slice(0, Math.min(data.length, 10));

  // Classify columns based on multiple rows
  const numericCols: string[] = [];
  const categoricalCols: string[] = [];
  const dateCols: string[] = [];

  for (const col of columns) {
    const values = sampleRows.map((r) => r[col]).filter((v) => v !== null && v !== undefined);
    if (values.length === 0) continue;

    const numCount = values.filter(isNumeric).length;
    const dateCount = values.filter(isDateLike).length;

    if (numCount >= values.length * 0.7) {
      numericCols.push(col);
    } else if (isDateColumn(col) || dateCount >= values.length * 0.7) {
      dateCols.push(col);
    } else {
      categoricalCols.push(col);
    }
  }

  // 1. Date column + numeric column(s) -> Line chart (time series / trend)
  if (dateCols.length >= 1 && numericCols.length >= 1) {
    return {
      type: "line",
      categoryKey: dateCols[0],
      valueKeys: numericCols,
      dateKey: dateCols[0],
    };
  }

  // 2. 1 categorical + multiple numeric -> Grouped Bar chart
  if (categoricalCols.length === 1 && numericCols.length > 1) {
    return {
      type: "grouped-bar",
      categoryKey: categoricalCols[0],
      valueKeys: numericCols,
    };
  }

  // 3. 1 categorical + 1 numeric
  if (categoricalCols.length >= 1 && numericCols.length >= 1) {
    const categoryKey = categoricalCols[0];
    const valueKey = numericCols[0];

    // Check if categorical values look like dates/years
    const firstVal = data[0][categoryKey];
    if (isDateColumn(categoryKey) || isDateLike(firstVal)) {
      return {
        type: "line",
        categoryKey,
        valueKeys: [valueKey],
        dateKey: categoryKey,
      };
    }

    // Small distribution / proportions (2 to 5 distinct categories) -> Pie / Donut Chart
    if (data.length >= 2 && data.length <= 5 && isDistributionColumn(categoryKey)) {
      return {
        type: "pie",
        categoryKey,
        valueKeys: [valueKey],
      };
    }

    // If categories <= 12 and labels are moderately short -> Vertical Bar chart
    const maxLabelLen = Math.max(...data.map((r) => String(r[categoryKey] ?? "").length));
    if (data.length <= 12 && maxLabelLen <= 18) {
      return {
        type: "bar",
        categoryKey,
        valueKeys: [valueKey],
      };
    }

    // Many categories or very long names -> Horizontal Bar chart
    if (data.length > 12 || maxLabelLen > 18) {
      return {
        type: "horizontal-bar",
        categoryKey,
        valueKeys: [valueKey],
      };
    }

    // Default categorical -> Standard vertical bar chart
    return {
      type: "bar",
      categoryKey,
      valueKeys: [valueKey],
    };
  }

  // Fallback: if 2 numeric columns (e.g. id and count), treat first as category
  if (numericCols.length >= 2) {
    return {
      type: "bar",
      categoryKey: numericCols[0],
      valueKeys: [numericCols[1]],
    };
  }

  return null;
}
