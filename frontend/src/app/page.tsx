"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { queryAI } from "@/lib/api";
import { addToHistory } from "@/lib/history";
import type { QueryResponse } from "@/types/query";

// Components
import HealthIndicator from "@/components/HealthIndicator";
import QueryInput from "@/components/QueryInput";
import ExampleQuestions from "@/components/ExampleQuestions";
import QueryHistory from "@/components/QueryHistory";
import LoadingState from "@/components/LoadingState";
import AnswerPanel from "@/components/AnswerPanel";
import KPICards from "@/components/KPICards";
import SmartChart from "@/components/SmartChart";
import DataTable from "@/components/DataTable";
import SQLViewer from "@/components/SQLViewer";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyKey, setHistoryKey] = useState(0); // Trigger to reload history

  async function handleAsk() {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || loading) return;

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const data = await queryAI(trimmedQuestion);
      setResponse(data);
      // Save to query history
      addToHistory(trimmedQuestion);
      // Trigger history list refresh
      setHistoryKey((prev) => prev + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to QueryAI."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSelectQuestion(q: string) {
    setQuestion(q);
    // Focus the textarea for immediate editing or sending
    const textarea = document.getElementById("query-input");
    if (textarea) {
      textarea.focus();
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-md">
              <Sparkles size={18} className="text-black" />
            </div>
            <div>
              <span className="text-lg font-semibold tracking-tight text-white block leading-none">
                QueryAI
              </span>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Ask questions about your data in plain English.
              </span>
            </div>
          </div>

          <HealthIndicator />
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-6 py-8">
        {/* Left Sidebar Query History */}
        <QueryHistory onSelect={handleSelectQuestion} refreshKey={historyKey} />

        {/* Main Console */}
        <main className="flex-1 space-y-8 min-w-0">
          {/* Query Formulation Section */}
          <section className="space-y-4">
            <QueryInput
              value={question}
              onChange={setQuestion}
              onSubmit={handleAsk}
              loading={loading}
            />

            <ExampleQuestions onSelect={handleSelectQuestion} disabled={loading} />
          </section>

          {/* Dynamic Content Area */}
          <section className="space-y-6">
            {/* 1. Loading State */}
            {loading && <LoadingState />}

            {/* 2. Error State */}
            {error && !loading && <ErrorState message={error} />}

            {/* 3. Results Panel */}
            {response && !loading && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* AI Explanation / Summary */}
                <AnswerPanel answer={response.answer} />

                {/* KPI/Summary Cards */}
                <KPICards columns={response.columns} data={response.data} />

                {/* Visualizations (if applicable) */}
                <SmartChart columns={response.columns} data={response.data} />

                {/* Raw Database Table View */}
                <DataTable columns={response.columns} data={response.data} />

                {/* Transparent Technical Details */}
                <SQLViewer sql={response.sql} />
              </div>
            )}

            {/* 4. Empty Landing State */}
            {!response && !loading && !error && <EmptyState />}
          </section>
        </main>
      </div>
    </div>
  );
}