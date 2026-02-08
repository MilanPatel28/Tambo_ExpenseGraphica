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
    FileText,
    Briefcase,
    Laptop,
    TrendingUp,
    MoreHorizontal,
} from "lucide-react";

// Zod schema for income form
export const incomeFormSchema = z.object({
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"),
    source: z.enum(["Salary", "Freelance", "Investments", "Other"], {
        required_error: "Source is required",
    }),
    description: z.string().min(1, "Description is required"),
});

export type IncomeFormData = z.infer<typeof incomeFormSchema>;

interface IncomeFormProps {
    onSubmit: (data: IncomeFormData) => void;
    initialData?: Partial<IncomeFormData>;
    isLoading?: boolean;
    mode?: "add" | "edit";
    className?: string;
    config?: {
        density?: "compact" | "comfortable" | "spacious";
        showTitle?: boolean;
    };
}

// Icon mapping for sources
const sourceIconMap: Record<string, React.ReactNode> = {
    Salary: <Briefcase className="h-4 w-4" />,
    Freelance: <Laptop className="h-4 w-4" />,
    Investments: <TrendingUp className="h-4 w-4" />,
    Other: <MoreHorizontal className="h-4 w-4" />,
};

const sourceOptions = [
    { value: "Salary", label: "Salary", icon: sourceIconMap.Salary },
    { value: "Freelance", label: "Freelance", icon: sourceIconMap.Freelance },
    { value: "Investments", label: "Investments", icon: sourceIconMap.Investments },
    { value: "Other", label: "Other", icon: sourceIconMap.Other },
];

export function IncomeForm({
    onSubmit,
    initialData,
    isLoading = false,
    mode = "add",
    className,
    config = {},
}: IncomeFormProps) {
    const { density = "comfortable", showTitle = true } = config;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<IncomeFormData>({
        resolver: zodResolver(incomeFormSchema),
        defaultValues: {
            amount: initialData?.amount || undefined,
            date: initialData?.date || new Date().toISOString().split("T")[0],
            source: initialData?.source || undefined,
            description: initialData?.description || "",
        },
    });

    const selectedSource = watch("source");

    const handleFormSubmit = (data: IncomeFormData) => {
        onSubmit(data);
        if (mode === "add") {
            reset({
                amount: undefined,
                date: new Date().toISOString().split("T")[0],
                source: undefined,
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
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <Plus className="h-5 w-5 text-emerald-600" />
                        </div>
                        {mode === "add" ? "Add New Income" : "Edit Income"}
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

                    {/* Source Field */}
                    <div>
                        <Select
                            options={sourceOptions}
                            value={selectedSource}
                            onChange={(value) => setValue("source", value as IncomeFormData["source"])}
                            label="Income Source"
                            placeholder="Select a source"
                            error={errors.source?.message}
                        />
                    </div>

                    {/* Description Field */}
                    <div>
                        <Input
                            type="text"
                            placeholder="Describe this income"
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
                        variant="success"
                        isLoading={isLoading}
                        className="w-full mt-2"
                    >
                        {mode === "add" ? (
                            <>
                                <Plus className="h-4 w-4" />
                                Add Income
                            </>
                        ) : (
                            "Update Income"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export { incomeFormSchema as IncomeFormSchema };
