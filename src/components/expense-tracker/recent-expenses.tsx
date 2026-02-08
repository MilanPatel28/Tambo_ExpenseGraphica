"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge, categoryColors, categoryIcons } from "./category-badge";
import { ArrowRight, TrendingDown, Receipt } from "lucide-react";
import type { Expense } from "@/services/expense-data";

interface RecentExpensesProps {
    expenses: Expense[];
    maxItems?: number;
    onViewAll?: () => void;
    className?: string;
}

export function RecentExpenses({
    expenses,
    maxItems = 5,
    onViewAll,
    className,
}: RecentExpensesProps) {
    const recentExpenses = expenses.slice(0, maxItems);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        }
    };

    if (expenses.length === 0) {
        return (
            <Card className={cn("", className)}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        Recent Expenses
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-center py-6 text-muted-foreground">
                        <TrendingDown className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No expenses yet</p>
                        <p className="text-xs mt-1">Use the chat to add your first expense</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        Recent Expenses
                    </CardTitle>
                    {onViewAll && expenses.length > maxItems && (
                        <button
                            onClick={onViewAll}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                            View all
                            <ArrowRight className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="space-y-2">
                    {recentExpenses.map((expense) => (
                        <div
                            key={expense.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <CategoryBadge
                                name={expense.category}
                                color={categoryColors[expense.category]}
                                icon={categoryIcons[expense.category]}
                                size="sm"
                                showIcon={true}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{expense.description}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(expense.date)}</p>
                            </div>
                            <span className="text-sm font-semibold text-red-500 tabular-nums">
                                -{formatCurrency(expense.amount)}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
