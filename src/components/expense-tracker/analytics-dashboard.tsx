"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AnalyticsSummary } from "./summary-card";
import { ExpenseChart, SpendingTrends } from "./expense-chart";
import { DailyTransactions } from "./daily-transactions";
import { ExpenseList } from "./expense-list";
import { FilterToolbar } from "./filter-toolbar";
import { z } from "zod";

// Zod schema for analytics dashboard props
export const analyticsDashboardSchema = z.object({
    summary: z.object({
        totalIncome: z.number().describe("Total income amount"),
        totalExpenses: z.number().describe("Total expenses amount"),
        balance: z.number().describe("Current balance (income - expenses)"),
        savingsRate: z.number().describe("Savings rate as percentage"),
        incomeChange: z.number().optional().describe("Income change percentage from last period"),
        expenseChange: z.number().optional().describe("Expense change percentage from last period"),
    }).describe("Financial summary data"),
    spendingByCategory: z.array(
        z.object({
            category: z.string(),
            amount: z.number(),
            percentage: z.number(),
            color: z.string().optional(),
        })
    ).describe("Spending breakdown by category"),
    trends: z.array(
        z.object({
            date: z.string(),
            income: z.number(),
            expenses: z.number(),
            balance: z.number(),
        })
    ).optional().describe("Spending trends over time"),
    className: z.string().optional(),
    config: z.object({
        showTrends: z.boolean().optional(),
        chartType: z.enum(["bar", "pie", "donut"]).optional(),
        density: z.enum(["compact", "comfortable", "spacious"]).optional(),
    }).optional(),
});

export type AnalyticsDashboardProps = z.infer<typeof analyticsDashboardSchema>;

export function AnalyticsDashboard({
    summary,
    spendingByCategory,
    trends,
    className,
    config = {},
}: AnalyticsDashboardProps) {
    const { showTrends = true, chartType = "donut", density = "comfortable" } = config;

    return (
        <div className={cn("space-y-6", className)}>
            {/* Summary Cards */}
            <AnalyticsSummary
                totalIncome={summary.totalIncome}
                totalExpenses={summary.totalExpenses}
                balance={summary.balance}
                savingsRate={summary.savingsRate}
                incomeChange={summary.incomeChange}
                expenseChange={summary.expenseChange}
                config={{ density }}
            />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending by Category */}
                <ExpenseChart
                    data={spendingByCategory}
                    chartType={chartType}
                    title="Spending by Category"
                    showLegend={true}
                />

                {/* Spending Trends */}
                {showTrends && trends && trends.length > 0 && (
                    <SpendingTrends
                        data={trends}
                        title="Income vs Expenses"
                        showIncome={true}
                        showExpenses={true}
                        showBalance={false}
                    />
                )}
            </div>
        </div>
    );
}

// Barrel export for easy import
export * from "./summary-card";
export * from "./expense-chart";
export * from "./expense-form";
export * from "./expense-list";
export * from "./income-form";
export * from "./category-badge";
export * from "./filter-toolbar";
export * from "./daily-transactions";
