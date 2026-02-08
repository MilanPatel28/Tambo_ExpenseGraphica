/**
 * @file auth-data.ts
 * @description Authentication service with CSV-based user storage
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// In-memory cache for users (simulating database)
let usersCache: UserWithPassword[] | null = null;

/**
 * Parse CSV content into user objects
 */
function parseUsersCSV(csvContent: string): UserWithPassword[] {
  const lines = csvContent.trim().split("\n");
  const headers = lines[0].split(",");
  
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const user: Record<string, string> = {};
    headers.forEach((header, index) => {
      user[header.trim()] = values[index]?.trim() || "";
    });
    return user as unknown as UserWithPassword;
  });
}

/**
 * Load users from CSV file
 */
async function loadUsers(): Promise<UserWithPassword[]> {
  if (usersCache) return usersCache;
  
  try {
    const response = await fetch("/data/users.csv");
    if (!response.ok) {
      console.error("Failed to load users CSV");
      return [];
    }
    const csvContent = await response.text();
    usersCache = parseUsersCSV(csvContent);
    return usersCache;
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

/**
 * Authenticate user with email and password
 */
export async function login(credentials: LoginCredentials): Promise<User | null> {
  const users = await loadUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === credentials.email.toLowerCase() && 
           u.password === credentials.password
  );
  
  if (!user) return null;
  
  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Register a new user
 * Calls the API route to persist data to CSV
 */
export async function register(data: RegisterData): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed");
    }

    const newUser: User = await response.json();
    
    // Invalidate cache so next login fetches fresh data
    usersCache = null;
    
    return newUser;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const users = await loadUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Check if email is available for registration
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  const users = await loadUsers();
  return !users.some((u) => u.email.toLowerCase() === email.toLowerCase());
}

// Auth session storage key
const AUTH_STORAGE_KEY = "expense_tracker_user";

/**
 * Save user to session storage
 */
export function saveUserSession(user: User): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }
}

/**
 * Get user from session storage
 */
export function getUserSession(): User | null {
  if (typeof window === "undefined") return null;
  
  const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

/**
 * Clear user session (logout)
 */
export function clearUserSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
