export interface QueryRequest {
  question: string;
}

export interface QueryResponse {
  question: string;
  sql: string | null;
  columns: string[];
  data: Record<string, unknown>[];
  answer: string;
  source?: "postgresql" | "csv" | "none";
  dataset_id?: string;
}

export interface HistoryEntry {
  question: string;
  timestamp: number;
}

export interface HistoryEntryWithSource extends HistoryEntry {
  source: "postgresql" | "csv" | "none";
  dataset_id?: string;
}

export type ChartType = "bar" | "horizontal-bar" | "line" | "area" | "pie" | "grouped-bar";

export interface ChartConfig {
  type: ChartType;
  categoryKey: string;
  valueKeys: string[];
  dateKey?: string;
}
