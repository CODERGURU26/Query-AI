import type { HistoryEntry } from "@/types/query";

const STORAGE_KEY = "queryai-history";
const MAX_ENTRIES = 20;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addToHistory(question: string): void {
  try {
    const trimmed = question.trim();
    if (!trimmed) return;

    let entries = getHistory();

    // Remove duplicate if exists (case-insensitive)
    entries = entries.filter(
      (entry) => entry.question.toLowerCase() !== trimmed.toLowerCase()
    );

    // Add to front
    entries.unshift({
      question: trimmed,
      timestamp: Date.now(),
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
