"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const Dialog = ({ children, open, onOpenChange }: any) => {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative z-50 w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
                {children}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-6 top-6 rounded-full opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500"
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Cerrar</span>
                </button>
            </div>
        </div>
    )
}

const DialogTrigger = ({ children, asChild }: any) => {
    // Basic trigger that doesn't hold state here, state is managed in the parent component for these bespoke implementations
    return children
}

const DialogContent = ({ className, children, ...props }: any) => {
    return (
        <div className={cn("p-8 md:p-10", className)} {...props}>
            {children}
        </div>
    )
}

const DialogHeader = ({ className, ...props }: any) => (
    <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-6", className)}
        {...props}
    />
)

const DialogTitle = ({ className, ...props }: any) => (
    <h2
        className={cn("text-3xl font-black leading-none tracking-tight uppercase tracking-[0.05em] text-slate-900 dark:text-white", className)}
        {...props}
    />
)

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle }
