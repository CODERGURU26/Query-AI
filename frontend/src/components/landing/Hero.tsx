"use client";

import Link from "next/link";
import HeroDemo from "./HeroDemo";
import { useScrollReveal } from "@/lib/useScrollReveal";

export default function Hero() {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden"
      id="hero"
    >
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div
          className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Left: Copy */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.06] px-3.5 py-1.5 mb-8">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-medium text-violet-300">
                AI-Powered Analytics
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Talk to your data.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-200">
                Get answers instantly.
              </span>
            </h1>

            <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-lg">
              QueryAI turns natural-language questions into actionable analytics
              — without requiring you to write SQL.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black hover:bg-zinc-200 transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-white/20"
              >
                Try QueryAI
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href="#interactive-demo"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .querySelector("#interactive-demo")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200"
              >
                See how it works
              </a>
            </div>

            {/* Trust signals */}
            <div className="mt-10 flex items-center gap-6 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-emerald-400" />
                PostgreSQL
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-violet-400" />
                CSV Upload
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-cyan-400" />
                AI Insights
              </div>
            </div>
          </div>

          {/* Right: Animated Demo Panel */}
          <div className="lg:pl-4">
            <HeroDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
