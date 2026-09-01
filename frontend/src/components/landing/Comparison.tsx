"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";

const traditionalSteps = [
  "Open database client",
  "Understand schema",
  "Write SQL query",
  "Debug query errors",
  "Run query",
  "Interpret raw results",
];

const queryaiSteps = [
  "Ask a question",
  "QueryAI processes",
  "Get insight",
];

export default function Comparison() {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });

  return (
    <section ref={ref} className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            From SQL complexity to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">
              natural-language simplicity.
            </span>
          </h2>
          <p className="text-zinc-400 text-base max-w-lg mx-auto">
            QueryAI simplifies common analytical workflows so you can focus on
            insights, not query syntax.
          </p>
        </div>

        {/* Comparison Grid */}
        <div
          className={`grid md:grid-cols-2 gap-6 max-w-4xl mx-auto transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Traditional */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-2 w-2 rounded-full bg-zinc-500" />
              <span className="text-sm font-semibold text-zinc-400">
                Traditional Workflow
              </span>
            </div>
            <div className="space-y-0">
              {traditionalSteps.map((step, i) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-mono font-bold shrink-0 transition-all duration-500 ${
                        isVisible
                          ? "border-zinc-700 bg-zinc-800/50 text-zinc-400 opacity-100"
                          : "opacity-0"
                      }`}
                      style={{ transitionDelay: isVisible ? `${i * 100 + 400}ms` : "0ms" }}
                    >
                      {i + 1}
                    </div>
                    {i < traditionalSteps.length - 1 && (
                      <div className="w-px h-6 bg-zinc-800 my-1" />
                    )}
                  </div>
                  <span
                    className={`text-sm text-zinc-400 pt-1.5 transition-all duration-500 ${
                      isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    }`}
                    style={{ transitionDelay: isVisible ? `${i * 100 + 400}ms` : "0ms" }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* QueryAI */}
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-2 w-2 rounded-full bg-violet-400" />
              <span className="text-sm font-semibold text-violet-300">
                QueryAI Workflow
              </span>
            </div>
            <div className="space-y-0">
              {queryaiSteps.map((step, i) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-mono font-bold shrink-0 transition-all duration-500 ${
                        isVisible
                          ? "border-violet-500/30 bg-violet-500/10 text-violet-300 opacity-100"
                          : "opacity-0"
                      }`}
                      style={{ transitionDelay: isVisible ? `${i * 150 + 800}ms` : "0ms" }}
                    >
                      {i + 1}
                    </div>
                    {i < queryaiSteps.length - 1 && (
                      <div className="w-px h-6 bg-violet-500/20 my-1" />
                    )}
                  </div>
                  <span
                    className={`text-sm text-violet-200 pt-1.5 transition-all duration-500 ${
                      isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    }`}
                    style={{ transitionDelay: isVisible ? `${i * 150 + 800}ms` : "0ms" }}
                  >
                    {step}
                  </span>
                </div>
              ))}

              {/* Time saved indicator */}
              <div
                className={`mt-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition-all duration-500 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
                style={{ transitionDelay: isVisible ? "1300ms" : "0ms" }}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">
                  Faster path to insight
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
