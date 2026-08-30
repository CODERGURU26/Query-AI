"use client";

import { useEffect, useState } from "react";
import { Database } from "lucide-react";
import { checkHealth } from "@/lib/api";

export default function HealthIndicator() {
  const [status, setStatus] = useState<"checking" | "healthy" | "unhealthy">(
    "checking"
  );

  useEffect(() => {
    let cancelled = false;

    checkHealth().then((healthy) => {
      if (!cancelled) {
        setStatus(healthy ? "healthy" : "unhealthy");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-500"
      aria-label={`System status: ${status}`}
      role="status"
    >
      <span
        className={`h-2 w-2 rounded-full transition-colors duration-500 ${
          status === "healthy"
            ? "bg-emerald-400"
            : status === "unhealthy"
            ? "bg-red-400"
            : "bg-zinc-600 animate-pulse"
        }`}
      />
      <Database size={12} />
      <span>
        {status === "healthy"
          ? "System Operational"
          : status === "unhealthy"
          ? "System Unavailable"
          : "Checking…"}
      </span>
    </div>
  );
}
