import type { HistoryEntry, QueryResponse } from "@/types/query";

const STORAGE_KEY = "queryai-history";
const MAX_ENTRIES = 50;

export interface HistoryEntryWithSource extends HistoryEntry {
  source: "postgresql" | "csv" | "none";
  dataset_id?: string;
  response?: QueryResponse;
}

function getHistory(): HistoryEntryWithSource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntryWithSource[];
  } catch {
    return [];
  }
}

export function addToHistory(
  question: string,
  source: "postgresql" | "csv" | "none" = "postgresql",
  dataset_id?: string,
  response?: QueryResponse
): void {
  try {
    const trimmed = question.trim();
    if (!trimmed) return;

    let entries = getHistory();

    // Remove duplicate if exists (case-insensitive, same source)
    entries = entries.filter(
      (entry) => !(entry.question.toLowerCase() === trimmed.toLowerCase() && entry.source === source)
    );

    // Add to front with full response data
    entries.unshift({
      question: trimmed,
      timestamp: Date.now(),
      source,
      dataset_id,
      response,
    });

    // Cap at max
    if (entries.length > MAX_ENTRIES) {
      entries = entries.slice(0, MAX_ENTRIES);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage may be unavailable
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Fail silently
  }
}

export function getHistoryEntries(): HistoryEntryWithSource[] {
  return getHistory();
}

/**
 * Checks whether a given dataset_id is present among any stored history entries.
 */
export function datasetExists(dataset_id: string): boolean {
  if (!dataset_id) return false;
  return getHistory().some((entry) => entry.dataset_id === dataset_id);
}

export function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getSourceLabel(source: "postgresql" | "csv" | "none"): string {
  if (source === "csv") return "CSV";
  if (source === "postgresql") return "PostgreSQL";
  return "QueryAI";
}

export function getSourceColor(source: "postgresql" | "csv" | "none"): string {
  if (source === "csv") return "violet-500";
  if (source === "postgresql") return "emerald-500";
  return "zinc-500";
}