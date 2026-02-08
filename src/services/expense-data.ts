/**
 * @file expense-data.ts
 * @description Service for expense data operations using API
 */

import { getUserSession } from "./auth-data";

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  type: "expense";
  userId?: string;
}

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  averageExpense: number;
  expenseCount: number;
  byCategory: Record<string, number>;
  byMonth: Record<string, number>;
}

/**
 * Get filtered expenses from API
 */
export async function getExpenses(filter?: ExpenseFilter): Promise<Expense[]> {
  const user = getUserSession();
  if (!user) return [];

  try {
    const response = await fetch(`/api/expenses?userId=${user.id}`);
    if (!response.ok) {
        console.error("Failed to fetch expenses");
        return [];
    }
    
    let expenses: Expense[] = await response.json();

    if (filter) {
        if (filter.startDate) {
        expenses = expenses.filter(e => e.date >= filter.startDate!);
        }
        if (filter.endDate) {
        expenses = expenses.filter(e => e.date <= filter.endDate!);
        }
        if (filter.category) {
        expenses = expenses.filter(e => e.category.toLowerCase() === filter.category!.toLowerCase());
        }
        if (filter.minAmount !== undefined) {
        expenses = expenses.filter(e => e.amount >= filter.minAmount!);
        }
        if (filter.maxAmount !== undefined) {
        expenses = expenses.filter(e => e.amount <= filter.maxAmount!);
        }
        if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        expenses = expenses.filter(e => 
            (e.description?.toLowerCase().includes(query) || false) ||
            e.category.toLowerCase().includes(query)
        );
        }
    }

    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
      console.error("Error getting expenses:", error);
      return [];
  }
}

/**
 * Add a new expense via API
 */
export async function addExpense(expense: Omit<Expense, "id" | "type">): Promise<Expense> {
  const user = getUserSession();
  if (!user) throw new Error("User not authenticated");

  try {
      const response = await fetch("/api/expenses", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              ...expense,
              userId: user.id,
              type: "expense"
          }),
      });

      if (!response.ok) {
          throw new Error("Failed to add expense");
      }

      return await response.json();
  } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
  }
}

/**
 * Update an existing expense via API
 */
export async function updateExpense(id: string, updates: Partial<Omit<Expense, "id" | "type">>): Promise<Expense | null> {
  try {
      const response = await fetch(`/api/expenses/${id}`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
      });

      if (!response.ok) {
          return null;
      }

      return await response.json();
  } catch (error) {
      console.error("Error updating expense:", error);
      return null;
  }
}

/**
 * Delete an expense via API
 */
export async function deleteExpense(id: string): Promise<boolean> {
  try {
      const response = await fetch(`/api/expenses/${id}`, {
          method: "DELETE",
      });

      return response.ok;
  } catch (error) {
      console.error("Error deleting expense:", error);
      return false;
  }
}

/**
 * Delete multiple expenses
 */
export async function deleteExpenses(ids: string[]): Promise<number> {
  // Process in parallel
  const results = await Promise.all(ids.map(id => deleteExpense(id)));
  return results.filter(success => success).length;
}

/**
 * Get expense summary/analytics
 */
export async function getExpenseSummary(filter?: ExpenseFilter): Promise<ExpenseSummary> {
  const filtered = await getExpenses(filter);
  
  const totalExpenses = filtered.reduce((sum, e) => sum + e.amount, 0);
  const byCategory: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  
  filtered.forEach(expense => {
    // By category
    byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
    
    // By month
    const month = expense.date.substring(0, 7); // YYYY-MM
    byMonth[month] = (byMonth[month] || 0) + expense.amount;
  });
  
  return {
    totalExpenses,
    averageExpense: filtered.length > 0 ? totalExpenses / filtered.length : 0,
    expenseCount: filtered.length,
    byCategory,
    byMonth,
  };
}

/**
 * Get recent expenses
 */
export async function getRecentExpenses(limit: number = 5): Promise<Expense[]> {
  const expenses = await getExpenses();
  return expenses.slice(0, limit);
}

/**
 * Get expenses grouped by date
 */
export async function getExpensesByDate(filter?: ExpenseFilter): Promise<Record<string, Expense[]>> {
  const filtered = await getExpenses(filter);
  const grouped: Record<string, Expense[]> = {};
  
  filtered.forEach(expense => {
    if (!grouped[expense.date]) {
      grouped[expense.date] = [];
    }
    grouped[expense.date].push(expense);
  });
  
  return grouped;
}

export type { Expense as ExpenseType };
