"use client";

import { useState } from "react";
import { ArrowUp, Database, Sparkles } from "lucide-react";

export default function Home() {
  const [question, setQuestion] = useState("");

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
              placeholder="Ask something about your data..."
              rows={4}
              className="w-full resize-none bg-transparent px-4 py-3 text-base text-white outline-none placeholder:text-zinc-600"
            />

            <div className="flex items-center justify-between border-t border-white/10 px-2 pt-2">
              <span className="px-2 text-xs text-zinc-600">
                Press Enter to ask
              </span>

              <button
                disabled={!question.trim()}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Ask QueryAI
                <ArrowUp size={16} />
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
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              {example}
            </button>
          ))}
        </div>
      </section>

      {/* Empty Dashboard Preview */}
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
    </main>
  );
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

      <h2 className="text-base font-medium">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}