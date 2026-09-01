// ============================================================
// QueryAI — Centralized Demo Data
// All mock data for the marketing landing page lives here.
// This data is deterministic and never touches the real backend.
// ============================================================

export interface DemoDataRow {
  [key: string]: string | number;
}

export interface DemoQuestion {
  id: string;
  question: string;
  insight: string;
  visualization: "bar" | "horizontal-bar" | "pie" | "area";
  categoryKey: string;
  valueKey: string;
  data: DemoDataRow[];
}

export const demoQuestions: DemoQuestion[] = [
  {
    id: "top-categories",
    question: "What are our top-selling categories?",
    insight:
      "Electronics is the highest-performing category with ₹12.4M in total sales, followed by Fashion at ₹9.8M. The top 5 categories account for over 78% of total revenue.",
    visualization: "bar",
    categoryKey: "category",
    valueKey: "revenue",
    data: [
      { category: "Electronics", revenue: 12400000 },
      { category: "Fashion", revenue: 9800000 },
      { category: "Home & Garden", revenue: 8700000 },
      { category: "Beauty", revenue: 6400000 },
      { category: "Sports", revenue: 5900000 },
      { category: "Books", revenue: 3200000 },
    ],
  },
  {
    id: "revenue-by-state",
    question: "Which states generate the most revenue?",
    insight:
      "Maharashtra leads with ₹18.2M in revenue, followed by Karnataka and Delhi. The top 3 states contribute over 45% of total national revenue.",
    visualization: "horizontal-bar",
    categoryKey: "state",
    valueKey: "revenue",
    data: [
      { state: "Maharashtra", revenue: 18200000 },
      { state: "Karnataka", revenue: 14500000 },
      { state: "Delhi", revenue: 12800000 },
      { state: "Tamil Nadu", revenue: 9400000 },
      { state: "Gujarat", revenue: 7600000 },
      { state: "Uttar Pradesh", revenue: 6900000 },
    ],
  },
  {
    id: "payment-methods",
    question: "Which payment method is most popular?",
    insight:
      "UPI dominates with 42% of all transactions, followed by Credit Card at 28%. Digital payments (UPI + wallets) account for over 55% of all orders.",
    visualization: "pie",
    categoryKey: "method",
    valueKey: "transactions",
    data: [
      { method: "UPI", transactions: 42000 },
      { method: "Credit Card", transactions: 28000 },
      { method: "Debit Card", transactions: 15000 },
      { method: "Net Banking", transactions: 9000 },
      { method: "Wallet", transactions: 6000 },
    ],
  },
  {
    id: "avg-order-value",
    question: "Which products have the highest average order value?",
    insight:
      "Premium Electronics leads with an average order value of ₹24,500, nearly 3x the platform average. Luxury Fashion follows at ₹18,200.",
    visualization: "bar",
    categoryKey: "product",
    valueKey: "avg_order_value",
    data: [
      { product: "Premium Electronics", avg_order_value: 24500 },
      { product: "Luxury Fashion", avg_order_value: 18200 },
      { product: "Home Appliances", avg_order_value: 12800 },
      { product: "Fitness Equipment", avg_order_value: 9500 },
      { product: "Beauty Premium", avg_order_value: 6200 },
    ],
  },
  {
    id: "revenue-over-time",
    question: "How has revenue changed over time?",
    insight:
      "Revenue shows consistent growth with a 23% increase over the last 6 months. Q2 showed the strongest growth at 31% quarter-over-quarter, driven by seasonal demand.",
    visualization: "area",
    categoryKey: "month",
    valueKey: "revenue",
    data: [
      { month: "Jan", revenue: 8200000 },
      { month: "Feb", revenue: 7800000 },
      { month: "Mar", revenue: 9400000 },
      { month: "Apr", revenue: 10200000 },
      { month: "May", revenue: 11800000 },
      { month: "Jun", revenue: 12400000 },
      { month: "Jul", revenue: 11200000 },
      { month: "Aug", revenue: 13600000 },
    ],
  },
];

// Hero demo data (simplified version for the hero panel)
export const heroDemoData = {
  question: "What are the top 10 product categories by sales?",
  processingSteps: [
    "Understanding question...",
    "Analyzing dataset...",
    "Generating insight...",
  ],
  results: [
    { category: "Electronics", sales: "₹12.4M" },
    { category: "Fashion", sales: "₹9.8M" },
    { category: "Home & Garden", sales: "₹8.7M" },
    { category: "Beauty", sales: "₹6.4M" },
    { category: "Sports", sales: "₹5.9M" },
  ],
  chartData: [
    { name: "Electronics", value: 12.4 },
    { name: "Fashion", value: 9.8 },
    { name: "Home & Garden", value: 8.7 },
    { name: "Beauty", value: 6.4 },
    { name: "Sports", value: 5.9 },
  ],
};

// Capabilities confirmed from the existing codebase
export const capabilities = [
  {
    title: "Natural-Language Analytics",
    description:
      "Ask questions about your data in plain English. No SQL knowledge required.",
    icon: "MessageSquareText" as const,
  },
  {
    title: "CSV Analysis",
    description:
      "Upload any CSV file and start querying it instantly with automatic schema detection.",
    icon: "FileSpreadsheet" as const,
  },
  {
    title: "PostgreSQL Analytics",
    description:
      "Connect to your PostgreSQL database and run analytical queries through natural language.",
    icon: "Database" as const,
  },
  {
    title: "Automatic Schema Understanding",
    description:
      "QueryAI automatically understands your database schema, table relationships, and column types.",
    icon: "Braces" as const,
  },
  {
    title: "SQL Generation",
    description:
      "Generates optimized SQL queries from your natural-language questions with full transparency.",
    icon: "Code" as const,
  },
  {
    title: "Data Visualization",
    description:
      "Automatic chart selection — bar, line, area, pie, and more — based on your data structure.",
    icon: "BarChart3" as const,
  },
  {
    title: "KPI Summaries",
    description:
      "Key metrics are automatically extracted and displayed as easy-to-read summary cards.",
    icon: "LayoutDashboard" as const,
  },
  {
    title: "Structured Results",
    description:
      "Every query returns organized columns, data tables, and exportable structured output.",
    icon: "Table" as const,
  },
  {
    title: "Interactive Data Tables",
    description:
      "Browse, sort, and explore your query results in a clean interactive table view.",
    icon: "Rows3" as const,
  },
  {
    title: "AI-Assisted Insights",
    description:
      "Receive intelligent written summaries explaining what your data means in context.",
    icon: "Sparkles" as const,
  },
];

// Technology stack confirmed from the repository
export const techStack = {
  frontend: [
    { name: "Next.js", description: "React framework for production" },
    { name: "React", description: "UI component library" },
    { name: "TypeScript", description: "Type-safe JavaScript" },
    { name: "Tailwind CSS", description: "Utility-first styling" },
    { name: "Recharts", description: "Data visualization" },
  ],
  backend: [
    { name: "FastAPI", description: "High-performance Python API" },
    { name: "Python", description: "Backend runtime" },
    { name: "Uvicorn", description: "ASGI server" },
  ],
  data: [
    { name: "PostgreSQL", description: "Relational database" },
    { name: "Pandas", description: "Data analysis library" },
    { name: "SQLAlchemy", description: "SQL toolkit & ORM" },
  ],
  ai: [
    { name: "OpenRouter", description: "LLM gateway" },
    { name: "Gemma", description: "Google AI model" },
  ],
};
