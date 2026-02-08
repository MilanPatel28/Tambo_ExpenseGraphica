"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cva } from "class-variance-authority";
import * as RechartsCore from "recharts";
import { z } from "zod";
import { categoryColors } from "./category-badge";

// Zod schema for expense chart props
export const expenseChartSchema = z.object({
    data: z.array(
        z.object({
            category: z.string().describe("Category name"),
            amount: z.number().describe("Total amount for this category"),
            percentage: z.number().describe("Percentage of total"),
            color: z.string().optional().describe("Color for this category"),
        })
    ).describe("Spending data by category"),
    chartType: z.enum(["bar", "pie", "donut"]).optional().describe("Type of chart to display"),
    title: z.string().optional().describe("Chart title"),
    showLegend: z.boolean().optional().describe("Whether to show legend"),
    className: z.string().optional().describe("Additional CSS classes"),
    config: z.object({
        height: z.number().optional().describe("Chart height in pixels"),
        showLabels: z.boolean().optional().describe("Show value labels"),
    }).optional(),
});

export type ExpenseChartProps = z.infer<typeof expenseChartSchema>;

const chartVariants = cva(
    "w-full rounded-lg overflow-hidden transition-all duration-200",
    {
        variants: {
            size: {
                default: "h-64",
                sm: "h-48",
                lg: "h-80",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

// Default colors if not provided in data
const defaultColors = [
    "#10b981", "#6366f1", "#f59e0b", "#8b5cf6",
    "#ec4899", "#f97316", "#ef4444", "#06b6d4", "#84cc16"
];

export function ExpenseChart({
    data,
    chartType = "bar",
    title = "Spending by Category",
    showLegend = true,
    className,
    config = {},
}: ExpenseChartProps) {
    const { height = 256, showLabels = false } = config;

    if (!data || data.length === 0) {
        return (
            <Card className={cn("", className)}>
                <CardHeader>
                    <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        <p>No expense data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Enhance data with colors
    const enhancedData = data.map((item, index) => ({
        ...item,
        color: item.color || categoryColors[item.category] || defaultColors[index % defaultColors.length],
    }));

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const renderChart = () => {
        switch (chartType) {
            case "bar":
                return (
                    <RechartsCore.BarChart data={enhancedData} layout="vertical">
                        <RechartsCore.CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                        <RechartsCore.XAxis type="number" tickFormatter={formatCurrency} stroke="var(--muted-foreground)" axisLine={false} tickLine={false} />
                        <RechartsCore.YAxis dataKey="category" type="category" width={100} stroke="var(--muted-foreground)" axisLine={false} tickLine={false} />
                        <RechartsCore.Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "var(--radius)",
                                color: "var(--foreground)",
                            }}
                        />
                        <RechartsCore.Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                            {enhancedData.map((entry, index) => (
                                <RechartsCore.Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </RechartsCore.Bar>
                    </RechartsCore.BarChart>
                );

            case "pie":
            case "donut":
                return (
                    <RechartsCore.PieChart>
                        <RechartsCore.Pie
                            data={enhancedData}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={chartType === "donut" ? 60 : 0}
                            outerRadius={90}
                            paddingAngle={2}
                            label={showLabels ? (props: { payload?: { category?: string; percentage?: number } }) => {
                                const { payload } = props;
                                const category = payload?.category ?? '';
                                const percentage = payload?.percentage ?? 0;
                                return `${category} (${percentage.toFixed(0)}%)`;
                            } : false}
                            labelLine={showLabels}
                        >
                            {enhancedData.map((entry, index) => (
                                <RechartsCore.Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </RechartsCore.Pie>
                        <RechartsCore.Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "var(--radius)",
                                color: "var(--foreground)",
                            }}
                        />
                        {showLegend && (
                            <RechartsCore.Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                iconType="circle"
                                iconSize={10}
                            />
                        )}
                    </RechartsCore.PieChart>
                );

            default:
                return null;
        }
    };

    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height }}>
                    <RechartsCore.ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </RechartsCore.ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

// Spending trends line chart
export const spendingTrendsSchema = z.object({
    data: z.array(
        z.object({
            date: z.string().describe("Date string"),
            income: z.number().describe("Income amount"),
            expenses: z.number().describe("Expense amount"),
            balance: z.number().describe("Balance (income - expenses)"),
        })
    ).describe("Trend data over time"),
    title: z.string().optional(),
    showIncome: z.boolean().optional(),
    showExpenses: z.boolean().optional(),
    showBalance: z.boolean().optional(),
    className: z.string().optional(),
});

export type SpendingTrendsProps = z.infer<typeof spendingTrendsSchema>;

export function SpendingTrends({
    data,
    title = "Spending Trends",
    showIncome = true,
    showExpenses = true,
    showBalance = true,
    className,
}: SpendingTrendsProps) {
    if (!data || data.length === 0) {
        return (
            <Card className={cn("", className)}>
                <CardHeader>
                    <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        <p>No trend data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <RechartsCore.ResponsiveContainer width="100%" height="100%">
                        <RechartsCore.LineChart data={data}>
                            <RechartsCore.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <RechartsCore.XAxis dataKey="date" stroke="var(--muted-foreground)" axisLine={false} tickLine={false} />
                            <RechartsCore.YAxis tickFormatter={formatCurrency} stroke="var(--muted-foreground)" axisLine={false} tickLine={false} />
                            <RechartsCore.Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "var(--radius)",
                                    color: "var(--foreground)",
                                }}
                            />
                            <RechartsCore.Legend />
                            {showIncome && (
                                <RechartsCore.Line
                                    type="monotone"
                                    dataKey="income"
                                    name="Income"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            )}
                            {showExpenses && (
                                <RechartsCore.Line
                                    type="monotone"
                                    dataKey="expenses"
                                    name="Expenses"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            )}
                            {showBalance && (
                                <RechartsCore.Line
                                    type="monotone"
                                    dataKey="balance"
                                    name="Balance"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    dot={false}
                                    strokeDasharray="5 5"
                                />
                            )}
                        </RechartsCore.LineChart>
                    </RechartsCore.ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
