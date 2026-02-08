/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";

// Import Expense Tracker Components
import { ExpenseForm, expenseFormSchema } from "@/components/expense-tracker/expense-form";
import { ExpenseList } from "@/components/expense-tracker/expense-list";
import { IncomeForm, incomeFormSchema } from "@/components/expense-tracker/income-form";
import { SummaryCard, AnalyticsSummary } from "@/components/expense-tracker/summary-card";
import { ExpenseChart, SpendingTrends, expenseChartSchema, spendingTrendsSchema } from "@/components/expense-tracker/expense-chart";
import { DailyTransactions, WeeklyTransactions } from "@/components/expense-tracker/daily-transactions";
import { AnalyticsDashboard, analyticsDashboardSchema } from "@/components/expense-tracker/analytics-dashboard";

// Import Expense Tracker Services
import {
  getExpenses,
  addExpense,
  deleteExpense,
  getExpenseSummary,
  getRecentExpenses,
} from "@/services/expense-data";
import {
  getIncome,
  addIncome,
  getIncomeSummary,
} from "@/services/income-data";
import {
  getCategories,
} from "@/services/category-data";
import {
  getBalanceSummary,
  getSpendingByCategory,
  getSpendingTrends,
  getMonthlyBreakdown,
} from "@/services/analytics-data";

import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  // Population Stats Tools (existing demo)
  {
    name: "countryPopulation",
    description:
      "A tool to get population statistics by country with advanced filtering options",
    tool: getCountryPopulations,
    inputSchema: z.object({
      continent: z.string().optional(),
      sortBy: z.enum(["population", "growthRate"]).optional(),
      limit: z.number().optional(),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        countryCode: z.string(),
        countryName: z.string(),
        continent: z.enum([
          "Asia",
          "Africa",
          "Europe",
          "North America",
          "South America",
          "Oceania",
        ]),
        population: z.number(),
        year: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "globalPopulation",
    description:
      "A tool to get global population trends with optional year range filtering",
    tool: getGlobalPopulationTrend,
    inputSchema: z.object({
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        year: z.number(),
        population: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  
  // ============================================
  // Expense Tracker Tools
  // ============================================
  
  {
    name: "getExpenses",
    description: "Get a list of expenses with optional filtering by date range, category, amount, or search query",
    tool: getExpenses,
    inputSchema: z.object({
      startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
      endDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
      category: z.string().optional().describe("Filter by category name"),
      minAmount: z.number().optional().describe("Minimum expense amount"),
      maxAmount: z.number().optional().describe("Maximum expense amount"),
      searchQuery: z.string().optional().describe("Search in description or category"),
    }),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        amount: z.number(),
        date: z.string(),
        category: z.string(),
        description: z.string(),
        type: z.literal("expense"),
      }),
    ),
  },
  {
    name: "addExpense",
    description: "Add a new expense with amount, date, category, and description",
    tool: addExpense,
    inputSchema: z.object({
      amount: z.number().describe("The expense amount in dollars"),
      date: z.string().describe("The date of the expense in YYYY-MM-DD format"),
      category: z.string().describe("The expense category (e.g., Groceries, Rent, Transportation, Utilities, Entertainment, Dining, Healthcare, Shopping, Subscriptions)"),
      description: z.string().describe("A description of what the expense was for"),
    }),
    outputSchema: z.object({
      id: z.string(),
      amount: z.number(),
      date: z.string(),
      category: z.string(),
      description: z.string(),
      type: z.literal("expense"),
    }),
  },
  {
    name: "deleteExpense",
    description: "Delete an expense by its ID",
    tool: deleteExpense,
    inputSchema: z.object({
      id: z.string().describe("The ID of the expense to delete"),
    }),
    outputSchema: z.boolean(),
  },
  {
    name: "getExpenseSummary",
    description: "Get a summary of expenses including total, average, count, and breakdown by category and month",
    tool: getExpenseSummary,
    inputSchema: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      category: z.string().optional(),
    }),
    outputSchema: z.object({
      totalExpenses: z.number(),
      averageExpense: z.number(),
      expenseCount: z.number(),
      byCategory: z.record(z.number()),
      byMonth: z.record(z.number()),
    }),
  },
  {
    name: "getRecentExpenses",
    description: "Get the most recent expenses",
    tool: getRecentExpenses,
    inputSchema: z.object({
      limit: z.number().optional().describe("Number of recent expenses to return, defaults to 5"),
    }),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        amount: z.number(),
        date: z.string(),
        category: z.string(),
        description: z.string(),
        type: z.literal("expense"),
      }),
    ),
  },
  {
    name: "getIncome",
    description: "Get a list of income entries with optional filtering",
    tool: getIncome,
    inputSchema: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      source: z.string().optional().describe("Filter by source: Salary, Freelance, Investments, or Other"),
    }),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        amount: z.number(),
        date: z.string(),
        source: z.enum(["Salary", "Freelance", "Investments", "Other"]),
        description: z.string(),
      }),
    ),
  },
  {
    name: "addIncome",
    description: "Add a new income entry",
    tool: addIncome,
    inputSchema: z.object({
      amount: z.number().describe("The income amount"),
      date: z.string().describe("The date in YYYY-MM-DD format"),
      source: z.enum(["Salary", "Freelance", "Investments", "Other"]).describe("The income source"),
      description: z.string().describe("Description of this income"),
    }),
    outputSchema: z.object({
      id: z.string(),
      amount: z.number(),
      date: z.string(),
      source: z.enum(["Salary", "Freelance", "Investments", "Other"]),
      description: z.string(),
    }),
  },
  {
    name: "getBalanceSummary",
    description: "Get a financial summary with total income, expenses, balance, and savings rate",
    tool: getBalanceSummary,
    inputSchema: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
    outputSchema: z.object({
      totalIncome: z.number(),
      totalExpenses: z.number(),
      balance: z.number(),
      savingsRate: z.number(),
    }),
  },
  {
    name: "getSpendingByCategory",
    description: "Get spending breakdown by category with amounts and percentages",
    tool: getSpendingByCategory,
    inputSchema: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
    outputSchema: z.array(
      z.object({
        category: z.string(),
        amount: z.number(),
        percentage: z.number(),
        color: z.string(),
      }),
    ),
  },
  {
    name: "getSpendingTrends",
    description: "Get spending trends over time showing daily income, expenses, and balance",
    tool: getSpendingTrends,
    inputSchema: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
    outputSchema: z.array(
      z.object({
        date: z.string(),
        income: z.number(),
        expenses: z.number(),
        balance: z.number(),
      }),
    ),
  },
  {
    name: "getCategories",
    description: "Get available expense and income categories",
    tool: getCategories,
    inputSchema: z.object({
      type: z.enum(["expense", "income"]).optional().describe("Filter by category type"),
    }),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
        icon: z.string(),
        type: z.enum(["expense", "income"]),
      }),
    ),
  },
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  // Existing demo components
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  
  // ============================================
  // Expense Tracker Components
  // ============================================
  
  {
    name: "ExpenseForm",
    description: "A form component for adding or editing expenses. Shows fields for amount, date, category selector, and description with validation.",
    component: ExpenseForm,
    propsSchema: z.object({
      mode: z.enum(["add", "edit"]).optional().describe("Whether this is for adding a new expense or editing an existing one"),
      initialData: z.object({
        amount: z.number().optional(),
        date: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
      }).optional().describe("Initial form values for editing"),
      config: z.object({
        density: z.enum(["compact", "comfortable", "spacious"]).optional(),
        showTitle: z.boolean().optional(),
      }).optional(),
    }),
  },
  {
    name: "IncomeForm",
    description: "A form component for adding or editing income entries. Shows fields for amount, date, source (Salary/Freelance/Investments/Other), and description.",
    component: IncomeForm,
    propsSchema: z.object({
      mode: z.enum(["add", "edit"]).optional(),
      initialData: z.object({
        amount: z.number().optional(),
        date: z.string().optional(),
        source: z.enum(["Salary", "Freelance", "Investments", "Other"]).optional(),
        description: z.string().optional(),
      }).optional(),
      config: z.object({
        density: z.enum(["compact", "comfortable", "spacious"]).optional(),
        showTitle: z.boolean().optional(),
      }).optional(),
    }),
  },
  {
    name: "ExpenseList",
    description: "A list component that displays expense transactions with category badges, amounts, and dates. Supports edit/delete actions and bulk selection.",
    component: ExpenseList,
    propsSchema: z.object({
      expenses: z.array(
        z.object({
          id: z.string(),
          amount: z.number(),
          date: z.string(),
          category: z.string(),
          description: z.string(),
          type: z.literal("expense"),
        })
      ).describe("Array of expense objects to display"),
      showBulkActions: z.boolean().optional().describe("Whether to show bulk selection and action toolbar"),
      config: z.object({
        density: z.enum(["compact", "comfortable", "spacious"]).optional(),
      }).optional(),
    }),
  },
  {
    name: "DailyTransactions",
    description: "Displays expenses grouped by day with daily totals. Shows a clean timeline view of transactions organized by date.",
    component: DailyTransactions,
    propsSchema: z.object({
      expenses: z.array(
        z.object({
          id: z.string(),
          amount: z.number(),
          date: z.string(),
          category: z.string(),
          description: z.string(),
          type: z.literal("expense"),
        })
      ).describe("Array of expense objects"),
      config: z.object({
        density: z.enum(["compact", "comfortable", "spacious"]).optional(),
        showDayTotal: z.boolean().optional(),
      }).optional(),
    }),
  },
  {
    name: "WeeklyTransactions",
    description: "Displays expenses grouped by week with collapsible sections. Shows category breakdown and weekly summaries.",
    component: WeeklyTransactions,
    propsSchema: z.object({
      expenses: z.array(
        z.object({
          id: z.string(),
          amount: z.number(),
          date: z.string(),
          category: z.string(),
          description: z.string(),
          type: z.literal("expense"),
        })
      ).describe("Array of expense objects"),
    }),
  },
  {
    name: "SummaryCard",
    description: "A gradient summary card that displays a financial metric like total income, expenses, balance, or savings with optional trend indicators.",
    component: SummaryCard,
    propsSchema: z.object({
      title: z.string().describe("Card title like 'Total Income' or 'Total Expenses'"),
      value: z.number().describe("The monetary value to display"),
      change: z.number().optional().describe("Percentage change from previous period"),
      changeLabel: z.string().optional().describe("Label for the change, e.g., 'vs last month'"),
      type: z.enum(["income", "expense", "balance", "savings"]).describe("Type determines the color scheme"),
      config: z.object({
        density: z.enum(["compact", "comfortable", "spacious"]).optional(),
        showTrend: z.boolean().optional(),
      }).optional(),
    }),
  },
  {
    name: "AnalyticsSummary",
    description: "A grid of summary cards showing total income, expenses, balance, and savings rate at a glance.",
    component: AnalyticsSummary,
    propsSchema: z.object({
      totalIncome: z.number().describe("Total income amount"),
      totalExpenses: z.number().describe("Total expenses amount"),
      balance: z.number().describe("Current balance"),
      savingsRate: z.number().describe("Savings rate percentage"),
      incomeChange: z.number().optional().describe("Income change percentage"),
      expenseChange: z.number().optional().describe("Expense change percentage"),
      config: z.object({
        density: z.enum(["compact", "comfortable", "spacious"]).optional(),
        columns: z.number().optional(),
      }).optional(),
    }),
  },
  {
    name: "ExpenseChart",
    description: "A chart component that visualizes spending by category. Supports bar, pie, and donut chart types.",
    component: ExpenseChart,
    propsSchema: expenseChartSchema,
  },
  {
    name: "SpendingTrends",
    description: "A line chart showing income and expense trends over time. Useful for visualizing financial patterns.",
    component: SpendingTrends,
    propsSchema: spendingTrendsSchema,
  },
  {
    name: "AnalyticsDashboard",
    description: "A complete analytics dashboard with summary cards, spending by category chart, and optional spending trends visualization.",
    component: AnalyticsDashboard,
    propsSchema: analyticsDashboardSchema,
  },
];
