"use client";

import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  // Sanitize error message — never show internal paths, keys, or stack traces
  const safeMessage = sanitizeError(message);

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-red-300 animate-in fade-in duration-300">
      <AlertCircle size={20} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-medium text-red-200">Something went wrong</p>
        <p className="mt-1 text-sm text-red-300/70">{safeMessage}</p>
      </div>
    </div>
  );
}

function sanitizeError(message: string): string {
  // Don't show internal paths
  if (/\/.*\/.*\.py/.test(message) || /\\.*\\.*\.py/.test(message)) {
    return "We couldn't execute this query. Please try another question.";
  }
  // Don't show stack traces
  if (/Traceback|stacktrace|at\s+\w+\s*\(/i.test(message)) {
    return "We couldn't execute this query. Please try another question.";
  }
  // Don't show credentials
  if (/password|api.key|secret|token|credential/i.test(message)) {
    return "A server error occurred. Please try again.";
  }
  // Connection errors
  if (/fetch|network|ECONNREFUSED|timeout/i.test(message)) {
    return "QueryAI couldn't reach the analytics server. Please check that the backend is running.";
  }
  return message;
}
