"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, User, MessageSquare, BarChart3 } from "lucide-react";

// Dashboard components
import { WeeklyCalendar, MonthlyMiniCalendar } from "@/components/expense-tracker/expense-calendar";
import { RecentExpenses } from "@/components/expense-tracker/recent-expenses";
import { MiniTrendChart } from "@/components/expense-tracker/mini-charts";
import { SummaryCard } from "@/components/expense-tracker/summary-card";

// Data fetching
import { getExpenses, getRecentExpenses, type Expense } from "@/services/expense-data";
import { getBalanceSummary, type BalanceSummary } from "@/services/analytics-data";

/**
 * Expense Tracker Page - Split Layout
 * Left: Dashboard with widgets
 * Right: AI Chat interface
 */
export default function ExpenseTrackerPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const mcpServers = useMcpServers();

    // Dashboard state
    const [expenses, setExpenses] = React.useState<Expense[]>([]);
    const [recentExpensesList, setRecentExpensesList] = React.useState<Expense[]>([]);
    const [summary, setSummary] = React.useState<BalanceSummary | null>(null);
    const [dataLoading, setDataLoading] = React.useState(true);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    // Load dashboard data
    useEffect(() => {
        async function loadData() {
            try {
                const [allExpenses, recent, balanceSummary] = await Promise.all([
                    getExpenses(),
                    getRecentExpenses(5),
                    getBalanceSummary(),
                ]);
                setExpenses(allExpenses);
                setRecentExpensesList(recent);
                setSummary(balanceSummary);
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setDataLoading(false);
            }
        }

        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    // Prepare chart data
    const expensesByDate = React.useMemo(() => {
        const map: Record<string, number> = {};
        expenses.forEach((e) => {
            map[e.date] = (map[e.date] || 0) + e.amount;
        });
        return Object.entries(map).map(([date, amount]) => ({ date, amount }));
    }, [expenses]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    // Don't render if not authenticated (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <TamboProvider
            apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
            components={components}
            tools={tools}
            tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
            mcpServers={mcpServers}
        >
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
                {/* Header */}
                <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                    Expense Tracker
                                </h1>
                                <p className="text-xs text-muted-foreground">AI-Powered Finance Management</p>
                            </div>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-3">
                            {user && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{user.name}</span>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline ml-1">Logout</span>
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Main Content - Split Layout */}
                <main className="max-w-[1600px] mx-auto">
                    <div className="flex h-[calc(100vh-65px)]">
                        {/* Left Panel - Dashboard */}
                        <div className="flex-1 overflow-y-auto p-4 border-r">
                            <div className="max-w-2xl mx-auto space-y-4">
                                {/* Summary Cards */}
                                {summary && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <SummaryCard
                                            title="Balance"
                                            value={summary.balance}
                                            type="balance"
                                            config={{ density: "compact", showTrend: false }}
                                        />
                                        <SummaryCard
                                            title="Total Spent"
                                            value={summary.totalExpenses}
                                            type="expense"
                                            config={{ density: "compact", showTrend: false }}
                                        />
                                    </div>
                                )}

                                {/* Weekly Calendar */}
                                <WeeklyCalendar expenses={expensesByDate} />

                                {/* Mini Trend Chart */}
                                <MiniTrendChart data={expensesByDate} days={7} />

                                {/* Recent Expenses */}
                                <RecentExpenses expenses={recentExpensesList} maxItems={5} />

                                {/* Monthly Mini Calendar */}
                                <MonthlyMiniCalendar expenses={expensesByDate} />
                            </div>
                        </div>

                        {/* Right Panel - Chat */}
                        <div className="w-[450px] flex flex-col bg-muted/20">
                            <div className="flex items-center gap-2 px-4 py-3 border-b bg-background/50">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">AI Assistant</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <MessageThreadFull className="h-full" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </TamboProvider>
    );
}
