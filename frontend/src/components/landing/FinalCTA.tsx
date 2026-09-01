"use client";

import Link from "next/link";
import { useScrollReveal } from "@/lib/useScrollReveal";

export default function FinalCTA() {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.15 });

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-500/[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 relative">
        <div
          className={`text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Your data already has the answers.
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-lg mx-auto">
            QueryAI helps you find them by simply asking.
          </p>

          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-black hover:bg-zinc-200 transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-white/20"
          >
            Start analyzing
            <span aria-hidden="true">→</span>
          </Link>

          {/* Subtle sub-text */}
          <p className="mt-6 text-xs text-zinc-600">
            PostgreSQL & CSV · No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
