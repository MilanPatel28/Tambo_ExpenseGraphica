import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Expense } from "@/services/expense-data";

const DATA_FILE_PATH = path.join(process.cwd(), "public", "data", "expenses.csv");

// Helper to read expenses with index
function readExpensesWithIndex(): { lines: string[], expenses: any[] } {
    if (!fs.existsSync(DATA_FILE_PATH)) {
        return { lines: [], expenses: [] };
    }
    const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf-8");
    const lines = fileContent.trim().split("\n");
    const headers = lines[0].split(",");

    const expenses = lines.map((line, index) => {
        if (index === 0) return null; // Skip header
        const values = line.split(",");
        const expense: any = { _lineIndex: index };
        headers.forEach((header, i) => {
            const val = values[i]?.trim();
            expense[header.trim()] = header.trim() === "amount" ? parseFloat(val) : val;
        });
        return expense;
    }).filter(Boolean);

    return { lines, expenses };
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;

    try {
        if (!fs.existsSync(DATA_FILE_PATH)) {
             return NextResponse.json({ error: "Data file not found" }, { status: 404 });
        }
        
        const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf-8");
        const lines = fileContent.trim().split("\n");
        // Filter out the line with the matching ID
        // Assuming ID is the first column
        const newLines = lines.filter((line, index) => {
             if (index === 0) return true; // Keep header
             const parts = line.split(",");
             return parts[0] !== id;
        });

        if (newLines.length === lines.length) {
            return NextResponse.json({ error: "Expense not found" }, { status: 404 });
        }

        fs.writeFileSync(DATA_FILE_PATH, newLines.join("\n"));
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error deleting expense:", error);
        return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
     const id = (await params).id;
     
     try {
        const updates = await request.json();
        const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf-8");
        const lines = fileContent.trim().split("\n");
        const headers = lines[0].split(",");
        
        let foundIndex = -1;
        let currentExpense: any = {};

        // Find the expense
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(",");
            if (parts[0] === id) {
                foundIndex = i;
                headers.forEach((header, hIndex) => {
                   currentExpense[header.trim()] = parts[hIndex];
                });
                break;
            }
        }

        if (foundIndex === -1) {
             return NextResponse.json({ error: "Expense not found" }, { status: 404 });
        }

        // Apply updates
        const updatedExpense = { ...currentExpense, ...updates };
        
        // Reconstruct CSV line
        const newLineParts = headers.map(header => {
            return updatedExpense[header.trim()];
        });
        
        lines[foundIndex] = newLineParts.join(",");
        
        fs.writeFileSync(DATA_FILE_PATH, lines.join("\n"));
        
        return NextResponse.json(updatedExpense);

     } catch (error) {
        console.error("Error updating expense:", error);
        return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
     }
}
