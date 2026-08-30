"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { queryAI, checkHealth } from "@/lib/api";
import { addToHistory, getHistoryEntries } from "@/lib/history";
import type { QueryResponse, HistoryEntryWithSource } from "@/types/query";

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
import DataSourceStatus from "@/components/DataSourceStatus";
import CsvUploader from "@/components/CsvUploader";
import Sidebar from "@/components/Sidebar";
import SuggestedQuestions from "@/components/SuggestedQuestions";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyKey, setHistoryKey] = useState(0);
  const [csvDataset, setCsvDataset] = useState<{
    dataset_id: string | null;
    filename: string | null;
  } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  async function handleAsk() {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || loading) return;

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      let data: QueryResponse;

      if (csvDataset && csvDataset.dataset_id) {
        // Query against CSV dataset
        const dataResp = await fetch(`${apiUrl}/csv/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: trimmedQuestion,
            dataset_id: csvDataset.dataset_id,
          }),
        });
        const result = await dataResp.json();
        if (!dataResp.ok) {
          throw new Error(result.detail || "CSV query failed.");
        }
        data = result as QueryResponse;
      } else {
        // Query against PostgreSQL
        const dataResp = await fetch(`${apiUrl}/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmedQuestion }),
        });
        const result = await dataResp.json();
        if (!dataResp.ok) {
          throw new Error(result.detail || "QueryAI couldn't answer this question.");
        }
        data = result as QueryResponse;
      }

      setResponse(data);
      // Save to query history
      addToHistory(trimmedQuestion, data.source || "postgresql", csvDataset?.dataset_id || undefined);
      // Trigger history list refresh
      setHistoryKey((prev) => prev + 1);
    } catch (err: any) {
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

  function handleNewQuery() {
    setQuestion("");
    setResponse(null);
    setError("");
    // Preserve CSV dataset - do NOT remove it when clicking New Query
    // Preserve history - it's managed by addToHistory
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
              <span className="text-lg font-semibold tracking-tight text-white block">
                QueryAI
              </span>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Ask questions about your data in plain English.
              </span>
            </div>
          </div>

          <DataSourceStatus onSelectHistory={() => {/* */} }/>
          <HealthIndicator />
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-6 py-8">
        {/* Sidebar - Query History */}
        <Sidebar
          onSelectQuestion={handleSelectQuestion}
          onClearHistory={() => {
            const { clearHistory } = require("@/lib/history");
            clearHistory();
            setHistoryKey((prev) => prev + 1);
          }}
          onNewQuery={handleNewQuery}
          currentSource={csvDataset ? "csv" : "postgresql"}
          currentDatasetId={csvDataset?.dataset_id}
          refreshHistory={() => setHistoryKey((prev) => prev + 1)}
        />

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
            <SuggestedQuestions
              response={response}
              onSelect={handleAsk}
              csvDataset={csvDataset}
            />
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

                {/* Raw Dataset Table View */}
                {response.source === "csv" && csvDataset
                  ? <DataTable columns={response.columns} data={response.data} />
                  : response && response.columns.length > 0 && <DataTable columns={response.columns} data={response.data} />}

                {/* Transparent Technical Details */}
                <SQLViewer sql={response.sql} />
              </div>
            )}

            {/* 4. Empty Landing State */}
            {!response && !loading && !error && <EmptyState />}

            {/* 5. CSV Uploader - shown when a CSV dataset is loaded */}
            {csvDataset && !response && (
              <CsvUploader
                dataset={csvDataset}
                onQuestion={handleAsk}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}