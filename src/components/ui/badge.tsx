import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-primary text-white shadow hover:bg-primary/80",
        secondary: "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
        destructive: "border-transparent bg-red-500 text-white shadow hover:bg-red-500/80",
        outline: "text-slate-950 dark:text-slate-50 border border-slate-200 dark:border-slate-800",
        success: "border-transparent bg-emerald-500 text-white shadow hover:bg-emerald-500/80",
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-slate-300",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
