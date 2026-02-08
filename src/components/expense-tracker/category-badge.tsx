"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    ShoppingCart,
    Home,
    Car,
    Zap,
    Film,
    Utensils,
    Heart,
    ShoppingBag,
    CreditCard,
    Briefcase,
    Laptop,
    TrendingUp,
    MoreHorizontal,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    ShoppingCart,
    Home,
    Car,
    Zap,
    Film,
    Utensils,
    Heart,
    ShoppingBag,
    CreditCard,
    Briefcase,
    Laptop,
    TrendingUp,
    MoreHorizontal,
};

interface CategoryBadgeProps {
    name: string;
    color?: string;
    icon?: string;
    size?: "sm" | "default" | "lg";
    showIcon?: boolean;
    className?: string;
}

export function CategoryBadge({
    name,
    color = "#64748b",
    icon = "MoreHorizontal",
    size = "default",
    showIcon = true,
    className,
}: CategoryBadgeProps) {
    const IconComponent = iconMap[icon] || MoreHorizontal;

    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        default: "text-xs px-2.5 py-1",
        lg: "text-sm px-3 py-1.5",
    };

    const iconSizes = {
        sm: "h-3 w-3",
        default: "h-3.5 w-3.5",
        lg: "h-4 w-4",
    };

    return (
        <Badge
            color={color}
            className={cn(
                "inline-flex items-center gap-1.5 font-medium transition-all duration-200 hover:shadow-md",
                sizeClasses[size],
                className
            )}
        >
            {showIcon && <IconComponent className={iconSizes[size]} />}
            <span>{name}</span>
        </Badge>
    );
}

// Category colors for quick reference
export const categoryColors: Record<string, string> = {
    Groceries: "#10b981",
    Rent: "#6366f1",
    Transportation: "#f59e0b",
    Utilities: "#8b5cf6",
    Entertainment: "#ec4899",
    Dining: "#f97316",
    Healthcare: "#ef4444",
    Shopping: "#06b6d4",
    Subscriptions: "#84cc16",
    Salary: "#22c55e",
    Freelance: "#3b82f6",
    Investments: "#a855f7",
    Other: "#64748b",
};

// Category icons for quick reference
export const categoryIcons: Record<string, string> = {
    Groceries: "ShoppingCart",
    Rent: "Home",
    Transportation: "Car",
    Utilities: "Zap",
    Entertainment: "Film",
    Dining: "Utensils",
    Healthcare: "Heart",
    Shopping: "ShoppingBag",
    Subscriptions: "CreditCard",
    Salary: "Briefcase",
    Freelance: "Laptop",
    Investments: "TrendingUp",
    Other: "MoreHorizontal",
};

export { iconMap };
