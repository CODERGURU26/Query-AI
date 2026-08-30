import type { QueryResponse } from "@/types/query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function queryAI(question: string): Promise<QueryResponse> {
  const res = await fetch(`${API_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: question.trim() }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Something went wrong.");
  }

  return data as QueryResponse;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "healthy";
  } catch {
    return false;
  }
}

// CSV API functions

export interface CSVUploadResponse {
  dataset_id: string;
  filename: string;
  rows: number;
  columns: number;
  schema: { name: string; type: string }[];
}

export interface CSVQueryRequest {
  question: string;
  dataset_id: string;
}

export interface CSVQueryResponse {
  question: string;
  source: string;
  dataset_id: string;
  sql: string | null;
  answer: string;
  columns: string[];
  data: Record<string, unknown>[];
  summary: Record<string, any>;
  visualization: Record<string, any>;
}

export async function csvUpload(file: File): Promise<CSVUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/csv/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "CSV upload failed.");
  }

  return data as CSVUploadResponse;
}

export async function csvQuery(
  request: CSVQueryRequest
): Promise<CSVQueryResponse> {
  const res = await fetch(`${API_URL}/csv/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "CSV query failed.");
  }

  return data as CSVQueryResponse;
}