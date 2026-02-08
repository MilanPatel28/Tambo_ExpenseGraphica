"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

const Dialog: React.FC<DialogProps> = ({ open, onClose, children, className }) => {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
                onClick={onClose}
            />
            <div
                className={cn(
                    "relative z-50 w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
};

interface DialogHeaderProps {
    children: React.ReactNode;
    onClose?: () => void;
    className?: string;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, onClose, className }) => (
    <div className={cn("flex items-center justify-between mb-4", className)}>
        <div className="text-lg font-semibold leading-none tracking-tight">{children}</div>
        {onClose && (
            <button
                onClick={onClose}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        )}
    </div>
);

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => (
    <div className={cn("text-sm text-muted-foreground", className)}>{children}</div>
);

interface DialogFooterProps {
    children: React.ReactNode;
    className?: string;
}

const DialogFooter: React.FC<DialogFooterProps> = ({ children, className }) => (
    <div className={cn("flex justify-end gap-2 mt-6", className)}>{children}</div>
);

export { Dialog, DialogHeader, DialogContent, DialogFooter };
