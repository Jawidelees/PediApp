"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const Checkbox = React.forwardRef<
    HTMLButtonElement,
    { checked?: boolean; onCheckedChange?: (checked: boolean) => void; className?: string }
>(({ checked, onCheckedChange, className }, ref) => (
    <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        ref={ref}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
            "peer h-5 w-5 shrink-0 rounded-lg border border-slate-200 dark:border-slate-800 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            checked ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-slate-50 dark:bg-slate-950",
            className
        )}
    >
        {checked && <Check className="h-4 w-4" />}
    </button>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
