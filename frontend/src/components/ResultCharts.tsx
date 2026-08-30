"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

interface ResultChartProps {
    data: Record<string, unknown>[];
    columns: string[];
}

function formatNumber(value: unknown): string {
    if (typeof value !== "number") {
        return String(value ?? "");
    }

    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
    }).format(value);
}

function isNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

export default function ResultChart({
    data,
    columns,
}: ResultChartProps) {
    if (!data || data.length === 0 || columns.length < 2) {
        return null;
    }

    const firstRow = data[0];

    // Find categorical column
    const categoryKey = columns.find(
        (column) => typeof firstRow[column] === "string"
    );

    // Find numeric column
    const valueKey = columns.find(
        (column) => isNumber(firstRow[column])
    );

    if (!categoryKey || !valueKey) {
        return null;
    }

    return (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-white">
                    Visual Analytics
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                    {valueKey.replaceAll("_", " ")} by{" "}
                    {categoryKey.replaceAll("_", " ")}
                </p>
            </div>

            {/* Chart */}
            <div className="h-[420px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{
                            top: 10,
                            right: 20,
                            left: 10,
                            bottom: 10,
                        }}
                    >
                        <CartesianGrid
                            stroke="#27272a"
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            type="number"
                            tick={{
                                fill: "#71717a",
                                fontSize: 12,
                            }}
                            tickFormatter={formatNumber}
                        />

                        <YAxis
                            type="category"
                            dataKey={categoryKey}
                            width={170}
                            tick={{
                                fill: "#a1a1aa",
                                fontSize: 12,
                            }}
                        />

                        <Tooltip />

                        <Bar
                            dataKey={valueKey}
                            fill="#8b5cf6"
                            radius={[0, 4, 4, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}