"use client";

import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AnswerPanelProps {
  answer: string;
}

export default function AnswerPanel({ answer }: AnswerPanelProps) {
  if (!answer) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 animate-in fade-in duration-500">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
          <Sparkles size={14} />
        </div>
        <h2 className="font-semibold text-white">AI Insight</h2>
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
              <p className="mb-3 text-zinc-300">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-white">{children}</strong>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 space-y-2">{children}</ol>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 space-y-2">{children}</ul>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-5 rounded-lg border border-zinc-800">
                <table className="w-full text-sm">{children}</table>
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
            code: ({ children, className }) => {
              // Block code vs inline code
              const isBlock = className?.includes("language-");
              if (isBlock) {
                return (
                  <code className="block rounded-lg bg-zinc-900/80 p-4 text-zinc-200 overflow-x-auto">
                    {children}
                  </code>
                );
              }
              return (
                <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-200 text-xs">
                  {children}
                </code>
              );
            },
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
              >
                {children}
              </a>
            ),
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>
    </div>
  );
}
