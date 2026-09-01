"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Technology", href: "#technology" },
  { label: "Try QueryAI", href: "/app" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#09090b]" role="contentinfo">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black">
                <Sparkles size={14} />
              </div>
              <span className="text-base font-semibold text-white">
                QueryAI
              </span>
            </div>
            <p className="text-sm text-zinc-500 max-w-xs">
              AI-powered analytics for modern data teams.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
            {footerLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .querySelector(link.href)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/[0.04] text-center">
          <p className="text-xs text-zinc-600">
            © 2026 QueryAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
