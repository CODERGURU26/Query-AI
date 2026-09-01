import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QueryAI — AI-Powered Data Analytics",
  description:
    "Ask questions about your business data in natural language and instantly get analytics, visualizations, and insights with QueryAI.",
  keywords: [
    "AI Analytics",
    "Natural Language SQL",
    "E-Commerce Analytics",
    "PostgreSQL Analytics",
    "CSV Analysis",
    "Business Intelligence",
  ],
  authors: [{ name: "QueryAI Team" }],
  openGraph: {
    title: "QueryAI — AI-Powered Data Analytics",
    description:
      "Ask questions about your business data in natural language and instantly get analytics, visualizations, and insights with QueryAI.",
    type: "website",
    siteName: "QueryAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "QueryAI — AI-Powered Data Analytics",
    description:
      "Ask questions about your business data in natural language and instantly get analytics, visualizations, and insights with QueryAI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100">
        {children}
      </body>
    </html>
  );
}
