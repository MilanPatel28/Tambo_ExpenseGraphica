"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

export interface SelectProps {
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
    ({ options, value, onChange, placeholder = "Select...", label, error, disabled, className }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [searchQuery, setSearchQuery] = React.useState("");
        const containerRef = React.useRef<HTMLDivElement>(null);

        const selectedOption = options.find((opt) => opt.value === value);

        const filteredOptions = options.filter((opt) =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        );

        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                    setSearchQuery("");
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const handleSelect = (optionValue: string) => {
            onChange?.(optionValue);
            setIsOpen(false);
            setSearchQuery("");
        };

        return (
            <div ref={ref} className={cn("w-full", className)}>
                {label && (
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        {label}
                    </label>
                )}
                <div ref={containerRef} className="relative">
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                            error && "border-destructive focus:ring-destructive"
                        )}
                    >
                        <span className={cn(!selectedOption && "text-muted-foreground")}>
                            {selectedOption ? (
                                <span className="flex items-center gap-2">
                                    {selectedOption.icon}
                                    {selectedOption.label}
                                </span>
                            ) : (
                                placeholder
                            )}
                        </span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
                    </button>

                    {isOpen && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-background shadow-lg animate-in fade-in-0 zoom-in-95">
                            <div className="p-2 border-b border-input">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-2 py-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-60 overflow-auto p-1">
                                {filteredOptions.length === 0 ? (
                                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                        No options found
                                    </div>
                                ) : (
                                    filteredOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            className={cn(
                                                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                                                value === option.value && "bg-accent text-accent-foreground"
                                            )}
                                        >
                                            {option.icon}
                                            {option.label}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
            </div>
        );
    }
);
Select.displayName = "Select";

export { Select };
