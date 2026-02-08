"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, X, Calendar, Filter, SlidersHorizontal } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { categoryColors } from "./category-badge";

// Search Filter Component
interface SearchFilterProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchFilter({
    value,
    onChange,
    placeholder = "Search expenses...",
    className,
}: SearchFilterProps) {
    const [localValue, setLocalValue] = React.useState(value);

    const debouncedOnChange = useDebouncedCallback((newValue: string) => {
        onChange(newValue);
    }, 300);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        debouncedOnChange(newValue);
    };

    const handleClear = () => {
        setLocalValue("");
        onChange("");
    };

    return (
        <div className={cn("relative", className)}>
            <Input
                type="text"
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                leftIcon={<Search className="h-4 w-4" />}
                rightIcon={
                    localValue ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null
                }
                className="pr-10"
            />
        </div>
    );
}

// Date Range Picker Component
interface DateRangePickerProps {
    startDate?: string;
    endDate?: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    className?: string;
}

export function DateRangePicker({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    className,
}: DateRangePickerProps) {
    const presets = [
        {
            label: "Today", getValue: () => {
                const today = new Date().toISOString().split("T")[0];
                return { start: today, end: today };
            }
        },
        {
            label: "This Week", getValue: () => {
                const now = new Date();
                const start = new Date(now);
                start.setDate(now.getDate() - now.getDay());
                return { start: start.toISOString().split("T")[0], end: now.toISOString().split("T")[0] };
            }
        },
        {
            label: "This Month", getValue: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                return { start: start.toISOString().split("T")[0], end: now.toISOString().split("T")[0] };
            }
        },
        {
            label: "Last 30 Days", getValue: () => {
                const now = new Date();
                const start = new Date(now);
                start.setDate(now.getDate() - 30);
                return { start: start.toISOString().split("T")[0], end: now.toISOString().split("T")[0] };
            }
        },
    ];

    const handlePresetClick = (preset: typeof presets[0]) => {
        const { start, end } = preset.getValue();
        onStartDateChange(start);
        onEndDateChange(end);
    };

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                    <Button
                        key={preset.label}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetClick(preset)}
                        className="text-xs"
                    >
                        {preset.label}
                    </Button>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <Input
                    type="date"
                    value={startDate || ""}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    leftIcon={<Calendar className="h-4 w-4" />}
                    className="flex-1"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                    type="date"
                    value={endDate || ""}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    leftIcon={<Calendar className="h-4 w-4" />}
                    className="flex-1"
                />
            </div>
        </div>
    );
}

// Category Multi-Select Component
interface CategoryFilterProps {
    selectedCategories: string[];
    onChange: (categories: string[]) => void;
    availableCategories: string[];
    className?: string;
}

export function CategoryFilter({
    selectedCategories,
    onChange,
    availableCategories,
    className,
}: CategoryFilterProps) {
    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            onChange(selectedCategories.filter((c) => c !== category));
        } else {
            onChange([...selectedCategories, category]);
        }
    };

    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {availableCategories.map((category) => {
                const isSelected = selectedCategories.includes(category);
                const color = categoryColors[category] || "#64748b";
                return (
                    <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                            isSelected
                                ? "ring-2 ring-offset-2"
                                : "opacity-60 hover:opacity-100"
                        )}
                        style={{
                            backgroundColor: `${color}20`,
                            color: color,
                            borderColor: color,
                            ...(isSelected && { ringColor: color }),
                        }}
                    >
                        {category}
                    </button>
                );
            })}
        </div>
    );
}

// Active Filters Display
interface ActiveFiltersProps {
    filters: {
        searchQuery?: string;
        startDate?: string;
        endDate?: string;
        categories?: string[];
        minAmount?: number;
        maxAmount?: number;
    };
    onRemoveFilter: (key: string, value?: string) => void;
    onClearAll: () => void;
    className?: string;
}

export function ActiveFilters({
    filters,
    onRemoveFilter,
    onClearAll,
    className,
}: ActiveFiltersProps) {
    const hasFilters =
        filters.searchQuery ||
        filters.startDate ||
        filters.endDate ||
        (filters.categories && filters.categories.length > 0) ||
        filters.minAmount !== undefined ||
        filters.maxAmount !== undefined;

    if (!hasFilters) return null;

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            <span className="text-sm text-muted-foreground">Active filters:</span>

            {filters.searchQuery && (
                <Badge variant="secondary" onRemove={() => onRemoveFilter("searchQuery")}>
                    Search: {filters.searchQuery}
                </Badge>
            )}

            {(filters.startDate || filters.endDate) && (
                <Badge variant="secondary" onRemove={() => {
                    onRemoveFilter("startDate");
                    onRemoveFilter("endDate");
                }}>
                    Date: {filters.startDate || "..."} - {filters.endDate || "..."}
                </Badge>
            )}

            {filters.categories?.map((category) => (
                <Badge
                    key={category}
                    color={categoryColors[category]}
                    onRemove={() => onRemoveFilter("categories", category)}
                >
                    {category}
                </Badge>
            ))}

            {(filters.minAmount !== undefined || filters.maxAmount !== undefined) && (
                <Badge variant="secondary" onRemove={() => {
                    onRemoveFilter("minAmount");
                    onRemoveFilter("maxAmount");
                }}>
                    Amount: ${filters.minAmount ?? 0} - ${filters.maxAmount ?? "∞"}
                </Badge>
            )}

            <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 px-2 text-xs">
                Clear all
            </Button>
        </div>
    );
}

// Combined Filter Toolbar
interface FilterToolbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    startDate?: string;
    endDate?: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    selectedCategories: string[];
    onCategoriesChange: (categories: string[]) => void;
    availableCategories: string[];
    onClearFilters: () => void;
    className?: string;
}

export function FilterToolbar({
    searchQuery,
    onSearchChange,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    selectedCategories,
    onCategoriesChange,
    availableCategories,
    onClearFilters,
    className,
}: FilterToolbarProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <Card className={cn("p-4 space-y-4", className)}>
            {/* Primary Search Bar */}
            <div className="flex items-center gap-3">
                <SearchFilter
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="flex-1"
                />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(isExpanded && "bg-accent")}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                </Button>
            </div>

            {/* Expanded Filters */}
            {isExpanded && (
                <div className="space-y-4 pt-2 border-t">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Date Range</label>
                        <DateRangePicker
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={onStartDateChange}
                            onEndDateChange={onEndDateChange}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Categories</label>
                        <CategoryFilter
                            selectedCategories={selectedCategories}
                            onChange={onCategoriesChange}
                            availableCategories={availableCategories}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={onClearFilters}>
                            Clear All Filters
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
