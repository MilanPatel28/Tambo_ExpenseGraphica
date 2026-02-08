"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PiggyBank,
    CreditCard,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

interface SummaryCardProps {
    title: string;
    value: number;
    change?: number;
    changeLabel?: string;
    type: "income" | "expense" | "balance" | "savings";
    icon?: React.ReactNode;
    className?: string;
    config?: {
        density?: "compact" | "comfortable" | "spacious";
        showTrend?: boolean;
    };
}

export function SummaryCard({
    title,
    value,
    change,
    changeLabel = "vs last month",
    type,
    icon,
    className,
    config = {},
}: SummaryCardProps) {
    const { density = "comfortable", showTrend = true } = config;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const gradientClasses = {
        income: "from-emerald-500/20 via-green-500/10 to-teal-500/20 border-emerald-300/30 dark:border-emerald-700/30",
        expense: "from-red-500/20 via-rose-500/10 to-pink-500/20 border-red-300/30 dark:border-red-700/30",
        balance: "from-blue-500/20 via-indigo-500/10 to-purple-500/20 border-blue-300/30 dark:border-blue-700/30",
        savings: "from-amber-500/20 via-orange-500/10 to-yellow-500/20 border-amber-300/30 dark:border-amber-700/30",
    };

    const iconBgClasses = {
        income: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        expense: "bg-red-500/20 text-red-600 dark:text-red-400",
        balance: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
        savings: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    };

    const valueColorClasses = {
        income: "text-emerald-600 dark:text-emerald-400",
        expense: "text-red-600 dark:text-red-400",
        balance: value >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400",
        savings: "text-amber-600 dark:text-amber-400",
    };

    const defaultIcons = {
        income: <Wallet className="h-5 w-5" />,
        expense: <CreditCard className="h-5 w-5" />,
        balance: <DollarSign className="h-5 w-5" />,
        savings: <PiggyBank className="h-5 w-5" />,
    };

    const paddingClasses = {
        compact: "p-4",
        comfortable: "p-5",
        spacious: "p-6",
    };

    const isPositiveChange = change !== undefined && change >= 0;
    const TrendIcon = isPositiveChange ? TrendingUp : TrendingDown;
    const ArrowIcon = isPositiveChange ? ArrowUpRight : ArrowDownRight;

    return (
        <Card
            className={cn(
                "relative overflow-hidden bg-gradient-to-br border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                gradientClasses[type],
                className
            )}
        >
            <div className={paddingClasses[density]}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl", iconBgClasses[type])}>
                        {icon || defaultIcons[type]}
                    </div>
                    {showTrend && change !== undefined && (
                        <div
                            className={cn(
                                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                                isPositiveChange
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}
                        >
                            <ArrowIcon className="h-3 w-3" />
                            {Math.abs(change).toFixed(1)}%
                        </div>
                    )}
                </div>

                {/* Content */}
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <p className={cn("text-3xl font-bold tracking-tight", valueColorClasses[type])}>
                        {type === "expense" && "-"}
                        {formatCurrency(Math.abs(value))}
                    </p>
                    {showTrend && change !== undefined && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <TrendIcon className={cn("h-3 w-3", isPositiveChange ? "text-emerald-500" : "text-red-500")} />
                            {changeLabel}
                        </p>
                    )}
                </div>
            </div>

            {/* Decorative gradient orb */}
            <div
                className={cn(
                    "absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-20 blur-2xl",
                    type === "income" && "bg-emerald-400",
                    type === "expense" && "bg-red-400",
                    type === "balance" && "bg-blue-400",
                    type === "savings" && "bg-amber-400"
                )}
            />
        </Card>
    );
}

// Dashboard with all summary cards
interface AnalyticsDashboardProps {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    savingsRate: number;
    incomeChange?: number;
    expenseChange?: number;
    className?: string;
    config?: {
        density?: "compact" | "comfortable" | "spacious";
        columns?: 2 | 4;
    };
}

export function AnalyticsSummary({
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
    incomeChange,
    expenseChange,
    className,
    config = {},
}: AnalyticsDashboardProps) {
    const { density = "comfortable", columns = 4 } = config;

    const gridClasses = {
        2: "grid-cols-1 sm:grid-cols-2",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={cn("grid gap-4", gridClasses[columns], className)}>
            <SummaryCard
                title="Total Income"
                value={totalIncome}
                change={incomeChange}
                type="income"
                config={{ density }}
            />
            <SummaryCard
                title="Total Expenses"
                value={totalExpenses}
                change={expenseChange}
                type="expense"
                config={{ density }}
            />
            <SummaryCard
                title="Current Balance"
                value={balance}
                type="balance"
                config={{ density, showTrend: false }}
            />
            <SummaryCard
                title="Savings Rate"
                value={savingsRate}
                type="savings"
                config={{ density, showTrend: false }}
                icon={<span className="text-lg font-bold">{savingsRate.toFixed(0)}%</span>}
            />
        </div>
    );
}
