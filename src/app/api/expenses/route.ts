import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Expense } from "@/services/expense-data";

const DATA_FILE_PATH = path.join(process.cwd(), "public", "data", "expenses.csv");

// Helper to read expenses
function readExpenses(): any[] {
  if (!fs.existsSync(DATA_FILE_PATH)) {
    return [];
  }
  const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf-8");
  const lines = fileContent.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const expense: any = {};
    headers.forEach((header, index) => {
      const val = values[index]?.trim();
      expense[header.trim()] = header.trim() === "amount" ? parseFloat(val) : val;
    });
    return expense;
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const allExpenses = readExpenses();
    const userExpenses = allExpenses.filter((e) => e.userId === userId);
    
    // Sort by date descending
    userExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(userExpenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, date, amount, category, description, type } = body;

    if (!userId || !date || !amount || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();
    
    // Ensure the new line string matches CSV format: id,userId,date,amount,category,description,type,createdAt
    // Escape commas in description if necessary
    const safeDescription = description ? description.replace(/,/g, " ") : "";
    const newLine = `${id},${userId},${date},${amount},${category},${safeDescription},${type || "expense"},${createdAt}`;

    let fileContent = "";
    if (fs.existsSync(DATA_FILE_PATH)) {
      fileContent = fs.readFileSync(DATA_FILE_PATH, "utf-8");
    } else {
      fileContent = "id,userId,date,amount,category,description,type,createdAt\n";
    }

    const contentToAppend = fileContent.endsWith("\n") ? newLine + "\n" : "\n" + newLine + "\n";
    fs.appendFileSync(DATA_FILE_PATH, contentToAppend);

    const newExpense = {
        id,
        userId,
        date,
        amount,
        category,
        description: safeDescription,
        type: type || "expense",
        createdAt
    };

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
