"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "bordered" | "elevated" | "gradient";
    gradient?: "blue" | "green" | "purple" | "orange" | "pink";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", gradient, ...props }, ref) => {
        const gradientClasses = {
            blue: "bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-indigo-500/10 border-blue-200/50 dark:border-blue-800/50",
            green: "bg-gradient-to-br from-emerald-500/10 via-green-600/5 to-teal-500/10 border-emerald-200/50 dark:border-emerald-800/50",
            purple: "bg-gradient-to-br from-purple-500/10 via-violet-600/5 to-pink-500/10 border-purple-200/50 dark:border-purple-800/50",
            orange: "bg-gradient-to-br from-orange-500/10 via-amber-600/5 to-yellow-500/10 border-orange-200/50 dark:border-orange-800/50",
            pink: "bg-gradient-to-br from-pink-500/10 via-rose-600/5 to-red-500/10 border-pink-200/50 dark:border-pink-800/50",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-xl transition-all duration-200",
                    variant === "default" && "bg-card text-card-foreground border border-border",
                    variant === "bordered" && "bg-card text-card-foreground border-2 border-border",
                    variant === "elevated" && "bg-card text-card-foreground shadow-lg shadow-black/5 border border-border/50",
                    variant === "gradient" && gradient && gradientClasses[gradient],
                    variant === "gradient" && gradient && "border backdrop-blur-sm",
                    className
                )}
                {...props}
            />
        );
    }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
            {...props}
        />
    )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn("text-lg font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
    )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-center p-6 pt-0", className)}
            {...props}
        />
    )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
