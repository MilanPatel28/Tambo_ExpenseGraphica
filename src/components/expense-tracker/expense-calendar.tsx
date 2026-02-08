"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyCalendarProps {
    expenses: { date: string; amount: number }[];
    selectedDate?: string;
    onDateSelect?: (date: string) => void;
    className?: string;
}

export function WeeklyCalendar({
    expenses,
    selectedDate,
    onDateSelect,
    className,
}: WeeklyCalendarProps) {
    const [weekOffset, setWeekOffset] = React.useState(0);

    // Get current week's dates
    const getWeekDates = (offset: number) => {
        const today = new Date();
        const currentDay = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDay + (offset * 7));

        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const weekDates = getWeekDates(weekOffset);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Create a map of date -> amount
    const expenseMap = React.useMemo(() => {
        const map: Record<string, number> = {};
        expenses.forEach((e) => {
            map[e.date] = (map[e.date] || 0) + e.amount;
        });
        return map;
    }, [expenses]);

    const formatDateKey = (date: Date) => {
        return date.toISOString().split("T")[0];
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(1)}k`;
        }
        return `$${amount.toFixed(0)}`;
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const getWeekTotal = () => {
        return weekDates.reduce((sum, date) => {
            return sum + (expenseMap[formatDateKey(date)] || 0);
        }, 0);
    };

    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Weekly Overview</CardTitle>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setWeekOffset((w) => w - 1)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-xs text-muted-foreground min-w-[80px] text-center">
                            {weekOffset === 0 ? "This Week" : weekOffset === -1 ? "Last Week" : `${Math.abs(weekOffset)} weeks ago`}
                        </span>
                        <button
                            onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
                            disabled={weekOffset >= 0}
                            className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-30"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="grid grid-cols-7 gap-1">
                    {weekDates.map((date, idx) => {
                        const dateKey = formatDateKey(date);
                        const amount = expenseMap[dateKey] || 0;
                        const isSelected = selectedDate === dateKey;
                        const isTodayDate = isToday(date);

                        return (
                            <button
                                key={dateKey}
                                onClick={() => onDateSelect?.(dateKey)}
                                title={`${date.toLocaleDateString()}: ${amount > 0 ? `$${amount.toFixed(2)}` : "No expenses"}`}
                                className={cn(
                                    "flex flex-col items-center p-2 rounded-lg transition-all duration-200",
                                    isSelected && "bg-primary/10 ring-2 ring-primary",
                                    isTodayDate && !isSelected && "bg-accent",
                                    !isSelected && !isTodayDate && "hover:bg-muted",
                                )}
                            >
                                <span className="text-[10px] text-muted-foreground uppercase">
                                    {dayNames[idx]}
                                </span>
                                <span className={cn(
                                    "text-sm font-medium mt-0.5",
                                    isTodayDate && "text-primary"
                                )}>
                                    {date.getDate()}
                                </span>
                                <span className={cn(
                                    "text-[10px] mt-1 font-medium",
                                    amount > 0 ? "text-red-500" : "text-muted-foreground/50"
                                )}>
                                    {amount > 0 ? formatCurrency(amount) : "-"}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Week Total</span>
                    <span className="text-sm font-semibold text-red-500">
                        -${getWeekTotal().toFixed(2)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

// Monthly mini calendar
interface MonthlyMiniCalendarProps {
    expenses: { date: string; amount: number }[];
    className?: string;
}

export function MonthlyMiniCalendar({
    expenses,
    className,
}: MonthlyMiniCalendarProps) {
    const [monthOffset, setMonthOffset] = React.useState(0);

    const getMonthData = (offset: number) => {
        const today = new Date();
        const targetMonth = new Date(today.getFullYear(), today.getMonth() + offset, 1);
        const year = targetMonth.getFullYear();
        const month = targetMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();

        return {
            year,
            month,
            monthName: targetMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            daysInMonth: lastDay.getDate(),
            startPadding,
        };
    };

    const monthData = getMonthData(monthOffset);

    // Create expense map
    const expenseMap = React.useMemo(() => {
        const map: Record<string, number> = {};
        expenses.forEach((e) => {
            map[e.date] = (map[e.date] || 0) + e.amount;
        });
        return map;
    }, [expenses]);

    const formatDateKey = (day: number) => {
        const month = String(monthData.month + 1).padStart(2, "0");
        const dayStr = String(day).padStart(2, "0");
        return `${monthData.year}-${month}-${dayStr}`;
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            today.getFullYear() === monthData.year &&
            today.getMonth() === monthData.month &&
            today.getDate() === day
        );
    };

    const getMonthTotal = () => {
        let total = 0;
        for (let day = 1; day <= monthData.daysInMonth; day++) {
            total += expenseMap[formatDateKey(day)] || 0;
        }
        return total;
    };

    const getIntensityClass = (amount: number) => {
        if (amount === 0) return "";
        if (amount < 20) return "bg-red-100 dark:bg-red-900/30";
        if (amount < 50) return "bg-red-200 dark:bg-red-800/40";
        if (amount < 100) return "bg-red-300 dark:bg-red-700/50";
        return "bg-red-400 dark:bg-red-600/60";
    };

    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Monthly View</CardTitle>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setMonthOffset((m) => m - 1)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-xs text-muted-foreground min-w-[100px] text-center">
                            {monthData.monthName}
                        </span>
                        <button
                            onClick={() => setMonthOffset((m) => Math.min(0, m + 1))}
                            disabled={monthOffset >= 0}
                            className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-30"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                        <div key={i} className="text-[10px] text-muted-foreground text-center py-1">
                            {day}
                        </div>
                    ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0.5">
                    {/* Empty cells for start padding */}
                    {Array.from({ length: monthData.startPadding }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {/* Days */}
                    {Array.from({ length: monthData.daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateKey = formatDateKey(day);
                        const amount = expenseMap[dateKey] || 0;
                        const isTodayDate = isToday(day);
                        const displayDate = new Date(monthData.year, monthData.month, day).toLocaleDateString();

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "aspect-square flex items-center justify-center text-xs rounded transition-colors cursor-default",
                                    getIntensityClass(amount),
                                    isTodayDate && "ring-1 ring-primary font-bold"
                                )}
                                title={`${displayDate}: ${amount > 0 ? `$${amount.toFixed(2)}` : "No expenses"}`}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Month Total</span>
                    <span className="text-sm font-semibold text-red-500">
                        -${getMonthTotal().toFixed(2)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
