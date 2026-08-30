export interface QueryRequest {
  question: string;
}

export interface QueryResponse {
  question: string;
  sql: string | null;
  columns: string[];
  data: Record<string, unknown>[];
  answer: string;
}

export interface HistoryEntry {
  question: string;
  timestamp: number;
}

export type ChartType = "bar" | "horizontal-bar" | "line" | "pie" | "grouped-bar";

export interface ChartConfig {
  type: ChartType;
  categoryKey: string;
  valueKeys: string[];
  dateKey?: string;
}
