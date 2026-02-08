/**
 * @file income-data.ts
 * @description Service for income data operations
 */

export interface Income {
  id: string;
  amount: number;
  date: string;
  source: "Salary" | "Freelance" | "Investments" | "Other";
  description: string;
}

export interface IncomeFilter {
  startDate?: string;
  endDate?: string;
  source?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface IncomeSummary {
  totalIncome: number;
  averageIncome: number;
  incomeCount: number;
  bySource: Record<string, number>;
  byMonth: Record<string, number>;
}

// Mock data storage
let incomeData: Income[] = [
  { id: "1", amount: 5500.00, date: "2026-02-01", source: "Salary", description: "Monthly salary" },
  { id: "2", amount: 800.00, date: "2026-02-05", source: "Freelance", description: "Web development project" },
  { id: "3", amount: 150.00, date: "2026-02-07", source: "Other", description: "Cash gift" },
  { id: "4", amount: 5500.00, date: "2026-01-01", source: "Salary", description: "Monthly salary" },
  { id: "5", amount: 1200.00, date: "2026-01-15", source: "Freelance", description: "Logo design project" },
  { id: "6", amount: 250.00, date: "2026-01-20", source: "Investments", description: "Dividend payment" },
  { id: "7", amount: 5500.00, date: "2025-12-01", source: "Salary", description: "Monthly salary" },
  { id: "8", amount: 600.00, date: "2025-12-10", source: "Freelance", description: "Consulting work" },
];

/**
 * Get filtered income entries
 */
export async function getIncome(filter?: IncomeFilter): Promise<Income[]> {
  let filtered = [...incomeData];

  if (filter) {
    if (filter.startDate) {
      filtered = filtered.filter(i => i.date >= filter.startDate!);
    }
    if (filter.endDate) {
      filtered = filtered.filter(i => i.date <= filter.endDate!);
    }
    if (filter.source) {
      filtered = filtered.filter(i => i.source.toLowerCase() === filter.source!.toLowerCase());
    }
    if (filter.minAmount !== undefined) {
      filtered = filtered.filter(i => i.amount >= filter.minAmount!);
    }
    if (filter.maxAmount !== undefined) {
      filtered = filtered.filter(i => i.amount <= filter.maxAmount!);
    }
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Add a new income entry
 */
export async function addIncome(income: Omit<Income, "id">): Promise<Income> {
  const newIncome: Income = {
    ...income,
    id: String(Date.now()),
  };
  incomeData.push(newIncome);
  return newIncome;
}

/**
 * Update an existing income entry
 */
export async function updateIncome(id: string, updates: Partial<Omit<Income, "id">>): Promise<Income | null> {
  const index = incomeData.findIndex(i => i.id === id);
  if (index === -1) return null;
  
  incomeData[index] = { ...incomeData[index], ...updates };
  return incomeData[index];
}

/**
 * Delete an income entry
 */
export async function deleteIncome(id: string): Promise<boolean> {
  const index = incomeData.findIndex(i => i.id === id);
  if (index === -1) return false;
  
  incomeData.splice(index, 1);
  return true;
}

/**
 * Get income summary/analytics
 */
export async function getIncomeSummary(filter?: IncomeFilter): Promise<IncomeSummary> {
  const filtered = await getIncome(filter);
  
  const totalIncome = filtered.reduce((sum, i) => sum + i.amount, 0);
  const bySource: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  
  filtered.forEach(income => {
    // By source
    bySource[income.source] = (bySource[income.source] || 0) + income.amount;
    
    // By month
    const month = income.date.substring(0, 7);
    byMonth[month] = (byMonth[month] || 0) + income.amount;
  });
  
  return {
    totalIncome,
    averageIncome: filtered.length > 0 ? totalIncome / filtered.length : 0,
    incomeCount: filtered.length,
    bySource,
    byMonth,
  };
}

/**
 * Get recent income entries
 */
export async function getRecentIncome(limit: number = 5): Promise<Income[]> {
  const sorted = [...incomeData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sorted.slice(0, limit);
}
