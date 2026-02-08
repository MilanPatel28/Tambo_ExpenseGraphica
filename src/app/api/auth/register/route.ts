import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { User } from "@/services/auth-data";

/**
 * API Route: /api/auth/register
 * 
 * Handles user registration by appending new users to the CSV file.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Path to users.csv
    const filePath = path.join(process.cwd(), "public", "data", "users.csv");
    
    // Read existing file content
    let fileContent = "";
    try {
      fileContent = fs.readFileSync(filePath, "utf-8");
    } catch (error) {
      // If file doesn't exist, create it with header
      fileContent = "id,email,password,name,createdAt\n";
    }

    // Check if email already exists
    const lines = fileContent.trim().split("\n");
    // Skip header line
    const emailExists = lines.slice(1).some(line => {
      const parts = line.split(",");
      // email is at index 1
      return parts[1]?.trim().toLowerCase() === email.toLowerCase();
    });

    if (emailExists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Generate new entry
    const id = `user_${Date.now()}`;
    const createdAt = new Date().toISOString().split("T")[0];
    const newLine = `${id},${email},${password},${name},${createdAt}`;

    // Append to file
    // If file ends with newline, append. If not, add newline then append.
    const contentToAppend = fileContent.endsWith("\n") ? newLine + "\n" : "\n" + newLine + "\n";
    
    fs.appendFileSync(filePath, contentToAppend);

    // Return success (excluding password)
    const newUser: User = {
      id,
      email,
      name,
      createdAt,
    };

    return NextResponse.json(newUser, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
