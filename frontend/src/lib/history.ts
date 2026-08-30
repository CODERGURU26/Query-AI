import type { HistoryEntry } from "@/types/query";

const STORAGE_KEY = "queryai-history";
const MAX_ENTRIES = 50;

export interface HistoryEntryWithSource extends HistoryEntry {
  source: "postgresql" | "csv" | "none";
  dataset_id?: string;
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

export function addToHistory(question: string, source: "postgresql" | "csv" | "none" = "postgresql", dataset_id?: string): void {
  try {
    const trimmed = question.trim();
    if (!trimmed) return;

    let entries = getHistory();

    // Remove duplicate if exists (case-insensitive, same source)
    entries = entries.filter(
      (entry) => !(entry.question.toLowerCase() === trimmed.toLowerCase() && entry.source === source)
    );

    // Add to front
    entries.unshift({
      question: trimmed,
      timestamp: Date.now(),
      source,
      dataset_id,
    });

    // Cap at max
    if (entries.length > MAX_ENTRIES) {
      entries = entries.slice(0, MAX_ENTRIES);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage may be unavailable (e.g. private browsing)
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

function formatTime(timestamp: number): string {
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