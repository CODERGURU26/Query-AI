/**
 * Format a number with locale-aware separators and 2 decimal places.
 * 1258681.3399999682 → "1,258,681.34"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as currency.
 * 1258681.34 → "$1,258,681.34"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number in compact form.
 * 1258681 → "1.26M"
 * 45200 → "45.2K"
 * 850 → "850"
 */
export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "") + "B";
  }
  if (abs >= 1_000_000) {
    return (value / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  }
  if (abs >= 10_000) {
    return (value / 1_000).toFixed(1).replace(/\.?0+$/, "") + "K";
  }
  return formatNumber(value);
}

/**
 * Convert a snake_case or camelCase column name to a readable label.
 * "product_category_name" → "Product Category Name"
 * "total_sales" → "Total Sales"
 */
export function formatColumnName(column: string): string {
  return column
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Smart value formatter for table cells.
 */
export function formatDisplayValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "number") {
    return formatNumber(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

/**
 * Check if a column name likely represents a monetary/sales value.
 */
export function isCurrencyColumn(columnName: string): boolean {
  const currencyPatterns = /price|cost|revenue|sales|amount|total|payment|value|fee|charge/i;
  return currencyPatterns.test(columnName);
}

/**
 * Format a value for chart axis ticks — compact form.
 */
export function formatAxisValue(value: number): string {
  return formatCompactNumber(value);
}
