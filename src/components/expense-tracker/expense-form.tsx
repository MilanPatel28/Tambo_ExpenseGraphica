"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Plus,
    Calendar,
    DollarSign,
    Tag,
    FileText,
    ShoppingCart,
    Home,
    Car,
    Zap,
    Film,
    Utensils,
    Heart,
    ShoppingBag,
    CreditCard,
} from "lucide-react";

// Zod schema for expense form
export const expenseFormSchema = z.object({
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(1, "Description is required"),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
    onSubmit: (data: ExpenseFormData) => void;
    initialData?: Partial<ExpenseFormData>;
    isLoading?: boolean;
    mode?: "add" | "edit";
    className?: string;
    config?: {
        density?: "compact" | "comfortable" | "spacious";
        showTitle?: boolean;
    };
}

// Icon mapping for categories
const categoryIconMap: Record<string, React.ReactNode> = {
    Groceries: <ShoppingCart className="h-4 w-4" />,
    Rent: <Home className="h-4 w-4" />,
    Transportation: <Car className="h-4 w-4" />,
    Utilities: <Zap className="h-4 w-4" />,
    Entertainment: <Film className="h-4 w-4" />,
    Dining: <Utensils className="h-4 w-4" />,
    Healthcare: <Heart className="h-4 w-4" />,
    Shopping: <ShoppingBag className="h-4 w-4" />,
    Subscriptions: <CreditCard className="h-4 w-4" />,
};

const categoryOptions = [
    { value: "Groceries", label: "Groceries", icon: categoryIconMap.Groceries },
    { value: "Rent", label: "Rent", icon: categoryIconMap.Rent },
    { value: "Transportation", label: "Transportation", icon: categoryIconMap.Transportation },
    { value: "Utilities", label: "Utilities", icon: categoryIconMap.Utilities },
    { value: "Entertainment", label: "Entertainment", icon: categoryIconMap.Entertainment },
    { value: "Dining", label: "Dining", icon: categoryIconMap.Dining },
    { value: "Healthcare", label: "Healthcare", icon: categoryIconMap.Healthcare },
    { value: "Shopping", label: "Shopping", icon: categoryIconMap.Shopping },
    { value: "Subscriptions", label: "Subscriptions", icon: categoryIconMap.Subscriptions },
];

export function ExpenseForm({
    onSubmit,
    initialData,
    isLoading = false,
    mode = "add",
    className,
    config = {},
}: ExpenseFormProps) {
    const { density = "comfortable", showTitle = true } = config;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseFormSchema),
        defaultValues: {
            amount: initialData?.amount || undefined,
            date: initialData?.date || new Date().toISOString().split("T")[0],
            category: initialData?.category || "",
            description: initialData?.description || "",
        },
    });

    const selectedCategory = watch("category");

    const handleFormSubmit = (data: ExpenseFormData) => {
        onSubmit(data);
        if (mode === "add") {
            reset({
                amount: undefined,
                date: new Date().toISOString().split("T")[0],
                category: "",
                description: "",
            });
        }
    };

    const paddingClasses = {
        compact: "p-4",
        comfortable: "p-6",
        spacious: "p-8",
    };

    const gapClasses = {
        compact: "gap-3",
        comfortable: "gap-4",
        spacious: "gap-6",
    };

    return (
        <Card variant="elevated" className={cn("w-full max-w-md", className)}>
            {showTitle && (
                <CardHeader className={paddingClasses[density]}>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Plus className="h-5 w-5 text-primary" />
                        </div>
                        {mode === "add" ? "Add New Expense" : "Edit Expense"}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent className={cn(paddingClasses[density], showTitle && "pt-0")}>
                <form onSubmit={handleSubmit(handleFormSubmit)} className={cn("flex flex-col", gapClasses[density])}>
                    {/* Amount Field */}
                    <div>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            label="Amount"
                            leftIcon={<DollarSign className="h-4 w-4" />}
                            error={errors.amount?.message}
                            {...register("amount", { valueAsNumber: true })}
                        />
                    </div>

                    {/* Date Field */}
                    <div>
                        <Input
                            type="date"
                            label="Date"
                            leftIcon={<Calendar className="h-4 w-4" />}
                            error={errors.date?.message}
                            {...register("date")}
                        />
                    </div>

                    {/* Category Field */}
                    <div>
                        <Select
                            options={categoryOptions}
                            value={selectedCategory}
                            onChange={(value) => setValue("category", value)}
                            label="Category"
                            placeholder="Select a category"
                            error={errors.category?.message}
                        />
                    </div>

                    {/* Description Field */}
                    <div>
                        <Input
                            type="text"
                            placeholder="What was this expense for?"
                            label="Description"
                            leftIcon={<FileText className="h-4 w-4" />}
                            error={errors.description?.message}
                            {...register("description")}
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full mt-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                        {mode === "add" ? (
                            <>
                                <Plus className="h-4 w-4" />
                                Add Expense
                            </>
                        ) : (
                            "Update Expense"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

// Schema export for Tambo registration
export { expenseFormSchema as ExpenseFormSchema };
