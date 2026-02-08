/**
 * @file expense-data.ts
 * @description Service for expense data operations
 */

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  type: "expense";
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

// Mock data storage (simulating CSV data)
let expenses: Expense[] = [
  { id: "1", amount: 1200.00, date: "2026-02-01", category: "Rent", description: "Monthly apartment rent", type: "expense" },
  { id: "2", amount: 85.50, date: "2026-02-02", category: "Groceries", description: "Weekly grocery shopping", type: "expense" },
  { id: "3", amount: 45.00, date: "2026-02-03", category: "Transportation", description: "Uber rides", type: "expense" },
  { id: "4", amount: 120.00, date: "2026-02-03", category: "Utilities", description: "Electricity bill", type: "expense" },
  { id: "5", amount: 25.99, date: "2026-02-04", category: "Entertainment", description: "Netflix subscription", type: "expense" },
  { id: "6", amount: 150.00, date: "2026-02-05", category: "Dining", description: "Restaurant with friends", type: "expense" },
  { id: "7", amount: 65.00, date: "2026-02-05", category: "Healthcare", description: "Pharmacy", type: "expense" },
  { id: "8", amount: 200.00, date: "2026-02-06", category: "Shopping", description: "New shoes", type: "expense" },
  { id: "9", amount: 42.50, date: "2026-02-06", category: "Groceries", description: "Fresh produce", type: "expense" },
  { id: "10", amount: 18.00, date: "2026-02-07", category: "Transportation", description: "Metro pass", type: "expense" },
  { id: "11", amount: 89.99, date: "2026-02-07", category: "Subscriptions", description: "Gym membership", type: "expense" },
  { id: "12", amount: 55.00, date: "2026-02-08", category: "Dining", description: "Lunch meeting", type: "expense" },
  { id: "13", amount: 32.00, date: "2026-02-08", category: "Entertainment", description: "Movie tickets", type: "expense" },
  { id: "14", amount: 75.00, date: "2026-01-28", category: "Groceries", description: "Bulk shopping", type: "expense" },
  { id: "15", amount: 180.00, date: "2026-01-25", category: "Shopping", description: "Winter jacket", type: "expense" },
  { id: "16", amount: 95.00, date: "2026-01-20", category: "Utilities", description: "Internet bill", type: "expense" },
  { id: "17", amount: 60.00, date: "2026-01-15", category: "Healthcare", description: "Doctor visit copay", type: "expense" },
  { id: "18", amount: 40.00, date: "2026-01-10", category: "Transportation", description: "Gas", type: "expense" },
  { id: "19", amount: 110.00, date: "2026-01-05", category: "Dining", description: "Birthday dinner", type: "expense" },
  { id: "20", amount: 28.00, date: "2026-01-03", category: "Entertainment", description: "Spotify premium", type: "expense" },
];

/**
 * Get filtered expenses
 */
export async function getExpenses(filter?: ExpenseFilter): Promise<Expense[]> {
  let filtered = [...expenses];

  if (filter) {
    if (filter.startDate) {
      filtered = filtered.filter(e => e.date >= filter.startDate!);
    }
    if (filter.endDate) {
      filtered = filtered.filter(e => e.date <= filter.endDate!);
    }
    if (filter.category) {
      filtered = filtered.filter(e => e.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter.minAmount !== undefined) {
      filtered = filtered.filter(e => e.amount >= filter.minAmount!);
    }
    if (filter.maxAmount !== undefined) {
      filtered = filtered.filter(e => e.amount <= filter.maxAmount!);
    }
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.description.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
      );
    }
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Add a new expense
 */
export async function addExpense(expense: Omit<Expense, "id" | "type">): Promise<Expense> {
  const newExpense: Expense = {
    ...expense,
    id: String(Date.now()),
    type: "expense",
  };
  expenses.push(newExpense);
  return newExpense;
}

/**
 * Update an existing expense
 */
export async function updateExpense(id: string, updates: Partial<Omit<Expense, "id" | "type">>): Promise<Expense | null> {
  const index = expenses.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  expenses[index] = { ...expenses[index], ...updates };
  return expenses[index];
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<boolean> {
  const index = expenses.findIndex(e => e.id === id);
  if (index === -1) return false;
  
  expenses.splice(index, 1);
  return true;
}

/**
 * Delete multiple expenses
 */
export async function deleteExpenses(ids: string[]): Promise<number> {
  const initialLength = expenses.length;
  expenses = expenses.filter(e => !ids.includes(e.id));
  return initialLength - expenses.length;
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
  const sorted = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sorted.slice(0, limit);
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
