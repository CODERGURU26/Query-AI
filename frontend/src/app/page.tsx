"use client";

import { useState } from "react";
import {
  ArrowUp,
  Database,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import ResultChart from "@/components/ResultCharts";

interface QueryResponse {
  question: string;
  sql: string | null;
  columns: string[];
  data: Record<string, unknown>[];
  answer: string;
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askQueryAI() {
    if (!question.trim() || loading) return;

    setLoading(true);
    setError("");
    setResponse(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${API_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong.");
      }

      setResponse(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to QueryAI."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQueryAI();
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
              <Sparkles size={18} />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              QueryAI
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <Database size={14} />
            PostgreSQL Connected
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400">
          <Sparkles size={14} />
          Natural language analytics
        </div>

        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Ask your data
          <br />
          <span className="text-zinc-500">anything.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          QueryAI converts natural-language questions into SQL, executes them
          against your database, and explains the results.
        </p>

        {/* Query Box */}
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 shadow-2xl">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something about your data..."
              rows={4}
              disabled={loading}
              className="w-full resize-none bg-transparent px-4 py-3 text-base text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
            />

            <div className="flex items-center justify-between border-t border-white/10 px-2 pt-2">
              <span className="px-2 text-xs text-zinc-600">
                {loading ? "QueryAI is thinking..." : "Press Enter to ask"}
              </span>

              <button
                onClick={askQueryAI}
                disabled={!question.trim() || loading}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {loading ? (
                  <>
                    Running
                    <Loader2 size={16} className="animate-spin" />
                  </>
                ) : (
                  <>
                    Ask QueryAI
                    <ArrowUp size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Example Questions */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {[
            "Top 10 product categories by sales",
            "Which states have the most customers?",
            "What is the average order value?",
          ].map((example) => (
            <button
              key={example}
              onClick={() => setQuestion(example)}
              disabled={loading}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
            >
              {example}
            </button>
          ))}
        </div>
      </section>

      {/* Error */}
      {error && (
        <section className="mx-auto max-w-5xl px-6 pb-8">
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-red-300">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-medium">Query failed</p>
              <p className="mt-1 text-sm text-red-300/70">{error}</p>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {response && (
        <Results response={response} />
      )}

      {/* Empty Dashboard */}
      {!response && !error && (
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="AI-powered SQL"
              description="Turn natural-language questions into safe PostgreSQL queries."
            />

            <FeatureCard
              title="Instant insights"
              description="Get a clear explanation of what your data actually means."
            />

            <FeatureCard
              title="Visual analytics"
              description="Explore query results through tables and intelligent charts."
            />
          </div>
        </section>
      )}
    </main>
  );
}

function Results({ response }: { response: QueryResponse }) {
  return (
    <section className="mx-auto max-w-7xl space-y-6 px-6 pb-20">
      {/* AI Answer */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles size={18} />

          <h2 className="font-semibold">
            AI Insight
          </h2>
        </div>
        <div className="prose prose-invert max-w-none text-sm leading-7 text-zinc-300">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-semibold text-white mt-6 mb-3">
                  {children}
                </h1>
              ),

              h2: ({ children }) => (
                <h2 className="text-lg font-semibold text-white mt-6 mb-3">
                  {children}
                </h2>
              ),

              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-white mt-5 mb-2">
                  {children}
                </h3>
              ),

              p: ({ children }) => (
                <p className="mb-3 text-zinc-300">
                  {children}
                </p>
              ),

              strong: ({ children }) => (
                <strong className="font-semibold text-white">
                  {children}
                </strong>
              ),

              ol: ({ children }) => (
                <ol className="list-decimal pl-6 space-y-2">
                  {children}
                </ol>
              ),

              ul: ({ children }) => (
                <ul className="list-disc pl-6 space-y-2">
                  {children}
                </ul>
              ),

              table: ({ children }) => (
                <div className="overflow-x-auto my-5 rounded-lg border border-zinc-800">
                  <table className="w-full text-sm">
                    {children}
                  </table>
                </div>
              ),

              th: ({ children }) => (
                <th className="px-4 py-3 text-left font-medium text-zinc-300 bg-zinc-900 border-b border-zinc-800">
                  {children}
                </th>
              ),

              td: ({ children }) => (
                <td className="px-4 py-3 text-zinc-300 border-b border-zinc-900">
                  {children}
                </td>
              ),

              code: ({ children }) => (
                <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-200">
                  {children}
                </code>
              ),
            }}
          >
            {response.answer}
          </ReactMarkdown>
        </div>
      </div>

      {response.data.length > 1 && (
        <ResultChart
          columns={response.columns}
          data={response.data}
        />
      )}

      {/* Results Table */}
      {response.data.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="font-semibold">
              Query Results
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              {response.data.length} rows returned
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr>
                  {response.columns.map((column) => (
                    <th
                      key={column}
                      className="px-6 py-4 font-medium text-zinc-400"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {response.data.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-white/5 last:border-0"
                  >
                    {response.columns.map((column) => (
                      <td
                        key={column}
                        className="px-6 py-4 text-zinc-300"
                      >
                        {formatValue(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SQL */}
      {response.sql && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="font-semibold">
              Generated SQL
            </h2>
          </div>

          <pre className="overflow-x-auto p-6 text-sm leading-7 text-zinc-400">
            <code>{response.sql}</code>
          </pre>
        </div>
      )}
    </section>
  );
}

function formatValue(value: unknown) {
  if (typeof value === "number") {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  }

  if (value === null || value === undefined) {
    return "—";
  }

  return String(value);
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-3 h-2 w-2 rounded-full bg-white" />

      <h2 className="text-base font-medium">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}