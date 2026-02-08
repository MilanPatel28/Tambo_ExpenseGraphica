"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseListItem } from "./expense-list";
import { CategoryBadge, categoryColors, categoryIcons } from "./category-badge";
import { ChevronDown, ChevronRight, Calendar } from "lucide-react";
import type { Expense } from "@/services/expense-data";

// Group expenses by date
function groupByDate(expenses: Expense[]): Record<string, Expense[]> {
    const grouped: Record<string, Expense[]> = {};
    expenses.forEach((expense) => {
        if (!grouped[expense.date]) {
            grouped[expense.date] = [];
        }
        grouped[expense.date].push(expense);
    });
    return grouped;
}

// Daily Transactions Component
interface DailyTransactionsProps {
    expenses: Expense[];
    onEdit?: (expense: Expense) => void;
    onDelete?: (id: string) => void;
    className?: string;
    config?: {
        density?: "compact" | "comfortable" | "spacious";
        showDayTotal?: boolean;
    };
}

export function DailyTransactions({
    expenses,
    onEdit,
    onDelete,
    className,
    config = {},
}: DailyTransactionsProps) {
    const { density = "comfortable", showDayTotal = true } = config;
    const groupedExpenses = groupByDate(expenses);
    const sortedDates = Object.keys(groupedExpenses).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

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
                weekday: "long",
                month: "short",
                day: "numeric",
            });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    if (expenses.length === 0) {
        return (
            <div className={cn("text-center py-12 text-muted-foreground", className)}>
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No transactions found</p>
                <p className="text-sm mt-1">Add your first expense to see it here</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-6", className)}>
            {sortedDates.map((date) => {
                const dayExpenses = groupedExpenses[date];
                const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

                return (
                    <div key={date}>
                        {/* Day Header */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-semibold text-foreground">{formatDate(date)}</h3>
                            </div>
                            {showDayTotal && (
                                <span className="text-sm font-medium text-red-500">
                                    -{formatCurrency(dayTotal)}
                                </span>
                            )}
                        </div>

                        {/* Day's Expenses */}
                        <div className="space-y-2">
                            {dayExpenses.map((expense) => (
                                <ExpenseListItem
                                    key={expense.id}
                                    expense={expense}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    config={{ density }}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Weekly Transactions with Collapsible Sections
interface WeeklyTransactionsProps {
    expenses: Expense[];
    onEdit?: (expense: Expense) => void;
    onDelete?: (id: string) => void;
    className?: string;
}

function getWeekNumber(date: Date): string {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
}

function getWeekDateRange(weekKey: string): string {
    const [year, week] = weekKey.split("-W").map(Number);
    const firstDayOfYear = new Date(year, 0, 1);
    const daysToAdd = (week - 1) * 7 - firstDayOfYear.getDay();
    const weekStart = new Date(year, 0, 1 + daysToAdd);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function WeeklyTransactions({
    expenses,
    onEdit,
    onDelete,
    className,
}: WeeklyTransactionsProps) {
    const [expandedWeeks, setExpandedWeeks] = React.useState<Set<string>>(new Set());

    // Group by week
    const groupedByWeek: Record<string, Expense[]> = {};
    expenses.forEach((expense) => {
        const weekKey = getWeekNumber(new Date(expense.date));
        if (!groupedByWeek[weekKey]) {
            groupedByWeek[weekKey] = [];
        }
        groupedByWeek[weekKey].push(expense);
    });

    const sortedWeeks = Object.keys(groupedByWeek).sort((a, b) => b.localeCompare(a));

    // Expand current week by default
    React.useEffect(() => {
        if (sortedWeeks.length > 0) {
            setExpandedWeeks(new Set([sortedWeeks[0]]));
        }
    }, []);

    const toggleWeek = (week: string) => {
        setExpandedWeeks((prev) => {
            const next = new Set(prev);
            if (next.has(week)) {
                next.delete(week);
            } else {
                next.add(week);
            }
            return next;
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    if (expenses.length === 0) {
        return (
            <div className={cn("text-center py-12 text-muted-foreground", className)}>
                <p className="text-lg font-medium">No transactions found</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-3", className)}>
            {sortedWeeks.map((week) => {
                const weekExpenses = groupedByWeek[week];
                const weekTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
                const isExpanded = expandedWeeks.has(week);

                // Get category breakdown
                const categoryTotals: Record<string, number> = {};
                weekExpenses.forEach((e) => {
                    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
                });
                const topCategories = Object.entries(categoryTotals)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3);

                return (
                    <Card key={week}>
                        {/* Week Header */}
                        <button
                            type="button"
                            onClick={() => toggleWeek(week)}
                            className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors rounded-t-xl"
                        >
                            <div className="flex items-center gap-3">
                                {isExpanded ? (
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                )}
                                <div className="text-left">
                                    <h3 className="font-semibold">{getWeekDateRange(week)}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {weekExpenses.length} transaction{weekExpenses.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-red-500">-{formatCurrency(weekTotal)}</p>
                                <div className="flex gap-1 mt-1">
                                    {topCategories.map(([category]) => (
                                        <div
                                            key={category}
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: categoryColors[category] || "#64748b" }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </button>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <CardContent className="pt-0 pb-4">
                                <div className="border-t pt-4 space-y-2">
                                    {weekExpenses
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((expense) => (
                                            <ExpenseListItem
                                                key={expense.id}
                                                expense={expense}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                            />
                                        ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}
