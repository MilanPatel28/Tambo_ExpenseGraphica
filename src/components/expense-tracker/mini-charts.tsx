"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as RechartsCore from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MiniTrendChartProps {
    data: { date: string; amount: number }[];
    days?: number;
    className?: string;
}

export function MiniTrendChart({
    data,
    days = 7,
    className,
}: MiniTrendChartProps) {
    // Get last N days of data
    const chartData = React.useMemo(() => {
        const today = new Date();
        const result = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split("T")[0];
            const dayData = data.find((d) => d.date === dateKey);

            result.push({
                date: dateKey,
                day: date.toLocaleDateString("en-US", { weekday: "short" }),
                amount: dayData?.amount || 0,
            });
        }

        return result;
    }, [data, days]);

    const totalSpent = chartData.reduce((sum, d) => sum + d.amount, 0);
    const avgDaily = totalSpent / days;

    // Calculate trend (compare last half to first half)
    const midPoint = Math.floor(days / 2);
    const firstHalf = chartData.slice(0, midPoint).reduce((sum, d) => sum + d.amount, 0);
    const secondHalf = chartData.slice(midPoint).reduce((sum, d) => sum + d.amount, 0);
    const trendUp = secondHalf > firstHalf;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const maxAmount = Math.max(...chartData.map((d) => d.amount), 1);

    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Daily Spending</CardTitle>
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                        trendUp
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    )}>
                        {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {trendUp ? "Spending up" : "Spending down"}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                {/* Stats row */}
                <div className="flex items-center justify-between mb-4 text-sm">
                    <div>
                        <p className="text-muted-foreground text-xs">Last {days} days</p>
                        <p className="font-semibold text-red-500">{formatCurrency(totalSpent)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-muted-foreground text-xs">Daily avg</p>
                        <p className="font-medium">{formatCurrency(avgDaily)}</p>
                    </div>
                </div>

                {/* Mini bar chart */}
                <div className="h-24">
                    <RechartsCore.ResponsiveContainer width="100%" height="100%">
                        <RechartsCore.BarChart data={chartData} barCategoryGap="20%">
                            <RechartsCore.XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                            />
                            <RechartsCore.Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                            />
                            <RechartsCore.Bar
                                dataKey="amount"
                                name="Spending"
                                fill="url(#barGradient)"
                                radius={[4, 4, 0, 0]}
                            />
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                                </linearGradient>
                            </defs>
                        </RechartsCore.BarChart>
                    </RechartsCore.ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

// Custom Tooltip Component
interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                <div className="mb-1 border-b pb-1 text-xs font-semibold text-foreground">
                    {payload[0].payload.date ? new Date(payload[0].payload.date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : label}
                </div>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color || entry.fill }}
                            />
                            {entry.name}:
                        </span>
                        <span className="font-medium font-mono">
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                            }).format(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Area chart version for trends
interface TrendAreaChartProps {
    data: { date: string; expenses: number; income?: number }[];
    days?: number;
    showIncome?: boolean;
    className?: string;
}

export function TrendAreaChart({
    data,
    days = 14,
    showIncome = false,
    className,
}: TrendAreaChartProps) {
    const chartData = React.useMemo(() => {
        const today = new Date();
        const result = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split("T")[0];
            const dayData = data.find((d) => d.date === dateKey);

            result.push({
                date: dateKey,
                label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                expenses: dayData?.expenses || 0,
                income: dayData?.income || 0,
            });
        }

        return result;
    }, [data, days]);

    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Spending Trend</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="h-32">
                    <RechartsCore.ResponsiveContainer width="100%" height="100%">
                        <RechartsCore.AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <RechartsCore.XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                                interval="preserveStartEnd"
                            />
                            <RechartsCore.YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                                tickFormatter={(v) => `$${v}`}
                                width={35}
                            />
                            <RechartsCore.Tooltip content={<CustomTooltip />} />
                            <RechartsCore.Area
                                type="monotone"
                                dataKey="expenses"
                                name="Expenses"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fill="url(#expenseGradient)"
                            />
                            {showIncome && (
                                <RechartsCore.Area
                                    type="monotone"
                                    dataKey="income"
                                    name="Income"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="url(#incomeGradient)"
                                />
                            )}
                        </RechartsCore.AreaChart>
                    </RechartsCore.ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
