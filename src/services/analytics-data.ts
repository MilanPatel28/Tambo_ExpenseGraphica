/**
 * @file analytics-data.ts
 * @description Service for analytics and reporting
 */

import { getExpenses, getExpenseSummary, type ExpenseFilter } from "./expense-data";
import { getIncome, getIncomeSummary, type IncomeFilter } from "./income-data";

export interface BalanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

export interface SpendingByCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface TrendDataPoint {
  date: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface MonthlyBreakdown {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  topCategories: { name: string; amount: number }[];
}

// Category colors mapping
const categoryColors: Record<string, string> = {
  "Groceries": "#10b981",
  "Rent": "#6366f1",
  "Transportation": "#f59e0b",
  "Utilities": "#8b5cf6",
  "Entertainment": "#ec4899",
  "Dining": "#f97316",
  "Healthcare": "#ef4444",
  "Shopping": "#06b6d4",
  "Subscriptions": "#84cc16",
};

/**
 * Get balance summary (income vs expenses)
 */
export async function getBalanceSummary(expenseFilter?: ExpenseFilter, incomeFilter?: IncomeFilter): Promise<BalanceSummary> {
  const expenseSummary = await getExpenseSummary(expenseFilter);
  const incomeSummary = await getIncomeSummary(incomeFilter);
  
  const balance = incomeSummary.totalIncome - expenseSummary.totalExpenses;
  const savingsRate = incomeSummary.totalIncome > 0 
    ? ((incomeSummary.totalIncome - expenseSummary.totalExpenses) / incomeSummary.totalIncome) * 100 
    : 0;
  
  return {
    totalIncome: incomeSummary.totalIncome,
    totalExpenses: expenseSummary.totalExpenses,
    balance,
    savingsRate,
  };
}

/**
 * Get spending by category with percentages
 */
export async function getSpendingByCategory(filter?: ExpenseFilter): Promise<SpendingByCategory[]> {
  const summary = await getExpenseSummary(filter);
  const total = summary.totalExpenses;
  
  return Object.entries(summary.byCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: categoryColors[category] || "#64748b",
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Get spending trends over time
 */
export async function getSpendingTrends(filter?: ExpenseFilter & IncomeFilter): Promise<TrendDataPoint[]> {
  const expenses = await getExpenses(filter);
  const income = await getIncome(filter);
  
  // Group by date
  const dataByDate: Record<string, { income: number; expenses: number }> = {};
  
  expenses.forEach(e => {
    if (!dataByDate[e.date]) {
      dataByDate[e.date] = { income: 0, expenses: 0 };
    }
    dataByDate[e.date].expenses += e.amount;
  });
  
  income.forEach(i => {
    if (!dataByDate[i.date]) {
      dataByDate[i.date] = { income: 0, expenses: 0 };
    }
    dataByDate[i.date].income += i.amount;
  });
  
  return Object.entries(dataByDate)
    .map(([date, data]) => ({
      date,
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get monthly breakdown with top categories
 */
export async function getMonthlyBreakdown(months: number = 6): Promise<MonthlyBreakdown[]> {
  const expenses = await getExpenses();
  const income = await getIncome();
  
  // Group by month
  const dataByMonth: Record<string, { 
    income: number; 
    expenses: number; 
    categories: Record<string, number> 
  }> = {};
  
  expenses.forEach(e => {
    const month = e.date.substring(0, 7);
    if (!dataByMonth[month]) {
      dataByMonth[month] = { income: 0, expenses: 0, categories: {} };
    }
    dataByMonth[month].expenses += e.amount;
    dataByMonth[month].categories[e.category] = (dataByMonth[month].categories[e.category] || 0) + e.amount;
  });
  
  income.forEach(i => {
    const month = i.date.substring(0, 7);
    if (!dataByMonth[month]) {
      dataByMonth[month] = { income: 0, expenses: 0, categories: {} };
    }
    dataByMonth[month].income += i.amount;
  });
  
  return Object.entries(dataByMonth)
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      savings: data.income - data.expenses,
      topCategories: Object.entries(data.categories)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3),
    }))
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, months);
}

/**
 * Get daily spending for a specific month
 */
export async function getDailySpending(year: number, month: number): Promise<{ day: number; amount: number }[]> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;
  
  const expenses = await getExpenses({ startDate, endDate });
  
  const dailyData: Record<number, number> = {};
  expenses.forEach(e => {
    const day = parseInt(e.date.split("-")[2]);
    dailyData[day] = (dailyData[day] || 0) + e.amount;
  });
  
  return Object.entries(dailyData)
    .map(([day, amount]) => ({ day: parseInt(day), amount }))
    .sort((a, b) => a.day - b.day);
}
