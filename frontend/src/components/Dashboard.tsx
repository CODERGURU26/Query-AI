"use client";

import { useState } from "react";
import { Sparkles, Upload, Database, FileText, X } from "lucide-react";
import { addToHistory, clearHistory } from "@/lib/history";
import type { QueryResponse, HistoryEntryWithSource } from "@/types/query";

// Components
import HealthIndicator from "@/components/HealthIndicator";
import QueryInput from "@/components/QueryInput";
import ExampleQuestions from "@/components/ExampleQuestions";
import LoadingState from "@/components/LoadingState";
import AnswerPanel from "@/components/AnswerPanel";
import KPICards from "@/components/KPICards";
import SmartChart from "@/components/SmartChart";
import DataTable from "@/components/DataTable";
import SQLViewer from "@/components/SQLViewer";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import DataSourceStatus from "@/components/DataSourceStatus";
import CsvUploader, { type CsvDataset } from "@/components/CsvUploader";
import Sidebar from "@/components/Sidebar";
import SuggestedQuestions from "@/components/SuggestedQuestions";

export default function Dashboard() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyKey, setHistoryKey] = useState(0);
  const [csvDataset, setCsvDataset] = useState<CsvDataset | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  async function handleAsk(overrideQuestion?: string) {
    const trimmedQuestion = (overrideQuestion ?? question).trim();
    if (!trimmedQuestion || loading) return;

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      let data: QueryResponse;

      if (csvDataset && csvDataset.dataset_id) {
        // Query against custom CSV dataset
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
        data = { ...result, source: (result.source as "csv" | "postgresql" | "none") || "csv" };
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
        data = { ...result, source: "postgresql" };
      }

      setQuestion(trimmedQuestion);
      setResponse(data);
      // Save to query history with full response object
      addToHistory(trimmedQuestion, data.source || "postgresql", csvDataset?.dataset_id || undefined, data);
      // Trigger history list refresh
      setHistoryKey((prev) => prev + 1);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to QueryAI."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSelectQuestion(q: string) {
    setQuestion(q);
    const textarea = document.getElementById("query-input");
    if (textarea) {
      textarea.focus();
    }
  }

  function handleSelectHistoryEntry(entry: HistoryEntryWithSource) {
    setQuestion(entry.question);
    setError("");
    if (entry.response) {
      // Instantly restore previous chat response
      setResponse(entry.response);
    } else {
      // Re-run the question if response was not cached
      handleAsk(entry.question);
    }
  }

  function handleNewQuery() {
    setQuestion("");
    setResponse(null);
    setError("");
  }

  function handleUploadComplete(uploaded: CsvDataset) {
    setCsvDataset(uploaded);
    setShowUploader(false);
    setResponse(null);
    setError("");
  }

  function handleClearCsv() {
    setCsvDataset(null);
    setShowUploader(false);
    setResponse(null);
    setError("");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-md">
                <Sparkles size={18} className="text-black" />
              </div>
              <div>
                <span className="text-lg font-semibold tracking-tight text-white block">
                  QueryAI
                </span>
                <span className="text-[10px] text-zinc-500 hidden sm:block">
                  Natural Language Analytics
                </span>
              </div>
            </div>

            {/* Source Switcher Buttons */}
            <div className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 ml-4">
              <button
                onClick={() => {
                  if (csvDataset) handleClearCsv();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  !csvDataset
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Database size={12} />
                <span>PostgreSQL</span>
              </button>

              <button
                onClick={() => setShowUploader(true)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  csvDataset
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FileText size={12} />
                <span>{csvDataset ? csvDataset.filename : "Custom CSV"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Upload CSV Button */}
            <button
              onClick={() => setShowUploader((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/20 transition-all shadow-sm"
            >
              <Upload size={13} />
              <span>{csvDataset ? "Manage CSV" : "Upload CSV"}</span>
            </button>

            <DataSourceStatus onSelectHistory={handleSelectQuestion} />
            <HealthIndicator />
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-6 py-8">
        {/* Sidebar - Query History */}
        <Sidebar
          onSelectHistoryEntry={handleSelectHistoryEntry}
          onClearHistory={() => {
            clearHistory();
            setHistoryKey((prev) => prev + 1);
          }}
          onNewQuery={handleNewQuery}
          currentSource={csvDataset ? "csv" : "postgresql"}
          currentDatasetId={csvDataset?.dataset_id ?? undefined}
          refreshKey={historyKey}
          activeQuestion={question}
        />

        {/* Main Console */}
        <main className="flex-1 space-y-6 min-w-0">
          {/* Active CSV Dataset Badge */}
          {csvDataset && !showUploader && (
            <div className="flex items-center justify-between p-3.5 px-4 rounded-xl border border-violet-500/30 bg-violet-500/10 animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 shrink-0">
                  <FileText size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    Active Dataset: <span className="text-violet-300">{csvDataset.filename}</span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    {csvDataset.rows} rows · {csvDataset.columns} columns · All queries target this CSV
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowUploader(true)}
                  className="px-2.5 py-1 text-xs font-medium text-violet-300 hover:text-white hover:bg-violet-500/20 rounded-lg transition-colors"
                >
                  View Schema
                </button>
                <button
                  onClick={handleClearCsv}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Switch back to PostgreSQL"
                >
                  <X size={13} />
                  <span>Return to PostgreSQL</span>
                </button>
              </div>
            </div>
          )}

          {/* CSV Uploader & Manager Panel (Collapsible/Toggleable) */}
          {showUploader && (
            <CsvUploader
              dataset={csvDataset}
              onUploadComplete={handleUploadComplete}
              onClose={() => setShowUploader(false)}
              onClearDataset={handleClearCsv}
            />
          )}

          {/* Query Formulation Section */}
          <section className="space-y-4">
            <QueryInput
              value={question}
              onChange={setQuestion}
              onSubmit={() => handleAsk()}
              loading={loading}
            />

            <ExampleQuestions
              onSelect={handleSelectQuestion}
              disabled={loading}
              csvDataset={csvDataset}
            />

            <SuggestedQuestions
              response={response}
              onSelect={(q) => handleAsk(q)}
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

                {/* Visualizations */}
                <SmartChart columns={response.columns} data={response.data} />

                {/* Raw Dataset Table View */}
                {response.columns.length > 0 && (
                  <DataTable columns={response.columns} data={response.data} />
                )}

                {/* Transparent Technical Details */}
                <SQLViewer sql={response.sql} />
              </div>
            )}

            {/* 4. Empty Landing State */}
            {!response && !loading && !error && !showUploader && (
              <EmptyState onUploadCsv={() => setShowUploader(true)} />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
