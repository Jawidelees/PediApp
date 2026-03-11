"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
    HTMLDivElement,
    { orientation?: "horizontal" | "vertical"; className?: string }
>(({ orientation = "horizontal", className }, ref) => (
    <div
        ref={ref}
        className={cn(
            "shrink-0 bg-slate-100 dark:bg-slate-800",
            orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
            className
        )}
    />
))
Separator.displayName = "Separator"

export { Separator }
