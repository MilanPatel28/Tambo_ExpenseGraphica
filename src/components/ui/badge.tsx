"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const badgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "bg-primary/10 text-primary",
                secondary: "bg-secondary text-secondary-foreground",
                destructive: "bg-destructive/10 text-destructive",
                outline: "border border-input text-foreground",
                success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    color?: string;
    onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, color, onRemove, children, style, ...props }, ref) => {
        const customStyle = color
            ? {
                ...style,
                backgroundColor: `${color}20`,
                color: color,
                borderColor: `${color}40`,
            }
            : style;

        return (
            <div
                ref={ref}
                className={cn(
                    badgeVariants({ variant: color ? undefined : variant }),
                    color && "border",
                    onRemove && "pr-1",
                    className
                )}
                style={customStyle}
                {...props}
            >
                {children}
                {onRemove && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                    </button>
                )}
            </div>
        );
    }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
