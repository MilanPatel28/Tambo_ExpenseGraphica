/**
 * @file category-data.ts
 * @description Service for category data operations
 */

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: "expense" | "income";
}

// Mock data storage
let categories: Category[] = [
  { id: "1", name: "Groceries", color: "#10b981", icon: "ShoppingCart", type: "expense" },
  { id: "2", name: "Rent", color: "#6366f1", icon: "Home", type: "expense" },
  { id: "3", name: "Transportation", color: "#f59e0b", icon: "Car", type: "expense" },
  { id: "4", name: "Utilities", color: "#8b5cf6", icon: "Zap", type: "expense" },
  { id: "5", name: "Entertainment", color: "#ec4899", icon: "Film", type: "expense" },
  { id: "6", name: "Dining", color: "#f97316", icon: "Utensils", type: "expense" },
  { id: "7", name: "Healthcare", color: "#ef4444", icon: "Heart", type: "expense" },
  { id: "8", name: "Shopping", color: "#06b6d4", icon: "ShoppingBag", type: "expense" },
  { id: "9", name: "Subscriptions", color: "#84cc16", icon: "CreditCard", type: "expense" },
  { id: "10", name: "Salary", color: "#22c55e", icon: "Briefcase", type: "income" },
  { id: "11", name: "Freelance", color: "#3b82f6", icon: "Laptop", type: "income" },
  { id: "12", name: "Investments", color: "#a855f7", icon: "TrendingUp", type: "income" },
  { id: "13", name: "Other", color: "#64748b", icon: "MoreHorizontal", type: "income" },
];

/**
 * Get all categories
 */
export async function getCategories(type?: "expense" | "income"): Promise<Category[]> {
  if (type) {
    return categories.filter(c => c.type === type);
  }
  return [...categories];
}

/**
 * Get category by name
 */
export async function getCategoryByName(name: string): Promise<Category | undefined> {
  return categories.find(c => c.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get category by id
 */
export async function getCategoryById(id: string): Promise<Category | undefined> {
  return categories.find(c => c.id === id);
}

/**
 * Add a new category
 */
export async function addCategory(category: Omit<Category, "id">): Promise<Category> {
  const newCategory: Category = {
    ...category,
    id: String(Date.now()),
  };
  categories.push(newCategory);
  return newCategory;
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, updates: Partial<Omit<Category, "id">>): Promise<Category | null> {
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  categories[index] = { ...categories[index], ...updates };
  return categories[index];
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return false;
  
  categories.splice(index, 1);
  return true;
}

/**
 * Get expense categories only
 */
export async function getExpenseCategories(): Promise<Category[]> {
  return categories.filter(c => c.type === "expense");
}

/**
 * Get income categories only
 */
export async function getIncomeCategories(): Promise<Category[]> {
  return categories.filter(c => c.type === "income");
}
