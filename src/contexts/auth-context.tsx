"use client";

import * as React from "react";
import { User, getUserSession, saveUserSession, clearUserSession, login, register } from "@/services/auth-data";
import type { LoginCredentials, RegisterData } from "@/services/auth-data";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    // Check for existing session on mount
    React.useEffect(() => {
        const storedUser = getUserSession();
        if (storedUser) {
            setUser(storedUser);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = async (credentials: LoginCredentials): Promise<boolean> => {
        try {
            const loggedInUser = await login(credentials);
            if (loggedInUser) {
                setUser(loggedInUser);
                saveUserSession(loggedInUser);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    const handleRegister = async (data: RegisterData): Promise<boolean> => {
        try {
            const newUser = await register(data);
            if (newUser) {
                setUser(newUser);
                saveUserSession(newUser);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Register error:", error);
            throw error;
        }
    };

    const handleLogout = () => {
        setUser(null);
        clearUserSession();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login: handleLogin,
                register: handleRegister,
                logout: handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
