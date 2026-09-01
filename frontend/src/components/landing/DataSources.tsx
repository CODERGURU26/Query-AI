"use client";

import { useState } from "react";
import { Database, FileSpreadsheet, Check } from "lucide-react";
import { useScrollReveal } from "@/lib/useScrollReveal";

const sources = [
  {
    id: "postgresql" as const,
    label: "PostgreSQL",
    icon: Database,
    tagline: "Connect to structured business data.",
    color: "emerald",
    features: [
      "PostgreSQL database connection",
      "Structured datasets",
      "SQL-powered analytics",
      "Existing database integration",
    ],
    visual: {
      table: "orders",
      columns: [
        { name: "order_id", type: "INT" },
        { name: "customer", type: "VARCHAR" },
        { name: "total", type: "DECIMAL" },
        { name: "status", type: "VARCHAR" },
      ],
      rows: [
        ["1001", "Priya S.", "₹2,450", "Delivered"],
        ["1002", "Rahul K.", "₹8,900", "Shipped"],
        ["1003", "Neha M.", "₹1,200", "Processing"],
      ],
    },
  },
  {
    id: "csv" as const,
    label: "CSV",
    icon: FileSpreadsheet,
    tagline: "Upload a dataset and start asking questions.",
    color: "violet",
    features: [
      "CSV file upload",
      "Automatic schema detection",
      "Dataset analysis with Pandas",
      "Natural-language queries",
    ],
    visual: {
      table: "sales_data.csv",
      columns: [
        { name: "product", type: "TEXT" },
        { name: "category", type: "TEXT" },
        { name: "revenue", type: "NUM" },
        { name: "region", type: "TEXT" },
      ],
      rows: [
        ["Laptop Pro", "Electronics", "₹45,000", "West"],
        ["Silk Saree", "Fashion", "₹3,200", "South"],
        ["Air Purifier", "Home", "₹12,500", "North"],
      ],
    },
  },
];

const colorStyles: Record<string, { tab: string; active: string; check: string; header: string }> = {
  emerald: {
    tab: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    active: "text-emerald-400",
    check: "text-emerald-400",
    header: "bg-emerald-500/[0.06] border-emerald-500/20",
  },
  violet: {
    tab: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    active: "text-violet-400",
    check: "text-violet-400",
    header: "bg-violet-500/[0.06] border-violet-500/20",
  },
};

export default function DataSources() {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState<"postgresql" | "csv">("postgresql");

  const active = sources.find((s) => s.id === activeTab)!;
  const colors = colorStyles[active.color];

  return (
    <section ref={ref} id="product" className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            One interface.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-violet-400">
              Multiple data sources.
            </span>
          </h2>
          <p className="text-zinc-400 text-base max-w-md mx-auto">
            QueryAI works with your existing data infrastructure.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          className={`flex justify-center mb-10 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            {sources.map((source) => {
              const Icon = source.icon;
              const isActive = activeTab === source.id;
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setActiveTab(source.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? colorStyles[source.color].tab
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon size={15} />
                  {source.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Card */}
        <div
          className={`max-w-4xl mx-auto transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Features */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <active.icon size={18} className={colors.active} />
                  <h3 className="text-lg font-semibold text-white">
                    {active.label}
                  </h3>
                </div>
                <p className="text-sm text-zinc-400">{active.tagline}</p>
              </div>

              <ul className="space-y-3">
                {active.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-sm text-zinc-300"
                  >
                    <Check size={14} className={colors.check} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Table */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0f] overflow-hidden">
              {/* Table header */}
              <div
                className={`flex items-center gap-2 px-4 py-2.5 border-b ${colors.header}`}
              >
                <active.icon size={13} className={colors.active} />
                <span className="text-xs font-mono text-zinc-400">
                  {active.visual.table}
                </span>
              </div>

              {/* Column headers */}
              <div className="grid border-b border-white/[0.06]" style={{ gridTemplateColumns: `repeat(${active.visual.columns.length}, 1fr)` }}>
                {active.visual.columns.map((col) => (
                  <div
                    key={col.name}
                    className="px-3 py-2 text-[10px] font-mono text-zinc-500 truncate"
                  >
                    {col.name}
                    <span className="ml-1 text-zinc-700">{col.type}</span>
                  </div>
                ))}
              </div>

              {/* Rows */}
              {active.visual.rows.map((row, ri) => (
                <div
                  key={ri}
                  className="grid border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors"
                  style={{ gridTemplateColumns: `repeat(${active.visual.columns.length}, 1fr)` }}
                >
                  {row.map((cell, ci) => (
                    <div
                      key={ci}
                      className="px-3 py-2 text-xs text-zinc-300 font-mono truncate"
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
