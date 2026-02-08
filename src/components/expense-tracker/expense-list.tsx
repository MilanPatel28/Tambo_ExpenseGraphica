"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryBadge, categoryColors, categoryIcons } from "./category-badge";
import { Pencil, Trash2, MoreVertical, Check } from "lucide-react";
import type { Expense } from "@/services/expense-data";

interface ExpenseListItemProps {
    expense: Expense;
    onEdit?: (expense: Expense) => void;
    onDelete?: (id: string) => void;
    isSelected?: boolean;
    onSelect?: (id: string, selected: boolean) => void;
    showCheckbox?: boolean;
    className?: string;
    config?: {
        density?: "compact" | "comfortable" | "spacious";
    };
}

export function ExpenseListItem({
    expense,
    onEdit,
    onDelete,
    isSelected = false,
    onSelect,
    showCheckbox = false,
    className,
    config = {},
}: ExpenseListItemProps) {
    const { density = "comfortable" } = config;
    const [showActions, setShowActions] = React.useState(false);

    const paddingClasses = {
        compact: "p-3",
        comfortable: "p-4",
        spacious: "p-5",
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        }
    };

    return (
        <Card
            variant="default"
            className={cn(
                "group relative transition-all duration-200 hover:shadow-md hover:border-primary/20",
                isSelected && "border-primary/50 bg-primary/5",
                className
            )}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className={cn("flex items-center gap-4", paddingClasses[density])}>
                {/* Checkbox for bulk selection */}
                {showCheckbox && (
                    <button
                        type="button"
                        onClick={() => onSelect?.(expense.id, !isSelected)}
                        className={cn(
                            "flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200",
                            isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/30 hover:border-primary/50"
                        )}
                    >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                    </button>
                )}

                {/* Category Badge */}
                <div className="flex-shrink-0">
                    <CategoryBadge
                        name={expense.category}
                        color={categoryColors[expense.category]}
                        icon={categoryIcons[expense.category]}
                        size="default"
                    />
                </div>

                {/* Description and Date */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                </div>

                {/* Amount */}
                <div className="flex-shrink-0 text-right">
                    <p className="font-semibold text-lg text-red-500 dark:text-red-400">
                        -{formatCurrency(expense.amount)}
                    </p>
                </div>

                {/* Action Buttons */}
                <div
                    className={cn(
                        "flex items-center gap-1 transition-opacity duration-200",
                        showActions || isSelected ? "opacity-100" : "opacity-0"
                    )}
                >
                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(expense)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(expense.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

// List component for multiple expenses
interface ExpenseListProps {
    expenses: Expense[];
    onEdit?: (expense: Expense) => void;
    onDelete?: (id: string) => void;
    onBulkDelete?: (ids: string[]) => void;
    showBulkActions?: boolean;
    className?: string;
    config?: {
        density?: "compact" | "comfortable" | "spacious";
    };
}

export function ExpenseList({
    expenses = [],
    onEdit,
    onDelete,
    onBulkDelete,
    showBulkActions = false,
    className,
    config = {},
}: ExpenseListProps) {
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

    const handleSelect = (id: string, selected: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (selected) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.size === expenses.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(expenses.map((e) => e.id)));
        }
    };

    const handleBulkDelete = () => {
        if (onBulkDelete && selectedIds.size > 0) {
            onBulkDelete(Array.from(selectedIds));
            setSelectedIds(new Set());
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const totalSelected = (expenses || [])
        .filter((e) => selectedIds.has(e.id))
        .reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className={cn("space-y-3", className)}>
            {/* Bulk Actions Toolbar */}
            {showBulkActions && expenses.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className={cn(
                                "flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200",
                                selectedIds.size === expenses.length
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : selectedIds.size > 0
                                        ? "border-primary bg-primary/20"
                                        : "border-muted-foreground/30 hover:border-primary/50"
                            )}
                        >
                            {selectedIds.size === expenses.length && <Check className="h-3.5 w-3.5" />}
                            {selectedIds.size > 0 && selectedIds.size < expenses.length && (
                                <div className="h-2 w-2 bg-primary rounded-sm" />
                            )}
                        </button>
                        <span className="text-sm text-muted-foreground">
                            {selectedIds.size > 0
                                ? `${selectedIds.size} selected (${formatCurrency(totalSelected)})`
                                : "Select all"}
                        </span>
                    </div>
                    {selectedIds.size > 0 && onBulkDelete && (
                        <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete ({selectedIds.size})
                        </Button>
                    )}
                </div>
            )}

            {/* Expense Items */}
            {expenses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg font-medium">No expenses found</p>
                    <p className="text-sm mt-1">Add your first expense to get started</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {expenses.map((expense) => (
                        <ExpenseListItem
                            key={expense.id}
                            expense={expense}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isSelected={selectedIds.has(expense.id)}
                            onSelect={handleSelect}
                            showCheckbox={showBulkActions}
                            config={config}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
