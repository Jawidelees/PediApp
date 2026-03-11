"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

const Select = ({ children, onValueChange, value }: any) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [selected, setSelected] = React.useState(value)

    const handleSelect = (val: string) => {
        setSelected(val)
        onValueChange?.(val)
        setIsOpen(false)
    }

    return (
        <div className="relative w-full">
            {React.Children.map(children, child => {
                if (child.type === SelectTrigger) {
                    return React.cloneElement(child, {
                        onClick: () => setIsOpen(!isOpen),
                        value: selected
                    })
                }
                if (child.type === SelectContent && isOpen) {
                    return React.cloneElement(child, {
                        onSelect: handleSelect,
                        onClose: () => setIsOpen(false),
                        selectedValue: selected
                    })
                }
                return null
            })}
        </div>
    )
}

const SelectTrigger = ({ className, children, value, ...props }: any) => {
    return (
        <button
            type="button"
            className={cn(
                "flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
}

const SelectValue = ({ placeholder, value }: any) => {
    return <span className="truncate">{value || placeholder}</span>
}

const SelectContent = ({ className, children, onSelect, onClose, selectedValue }: any) => {
    return (
        <>
            <div className="fixed inset-0 z-50" onClick={onClose} />
            <div
                className={cn(
                    "absolute top-full left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-2xl animate-in fade-in zoom-in-95",
                    className
                )}
            >
                {React.Children.map(children, child =>
                    React.cloneElement(child, {
                        onSelect: () => onSelect(child.props.value),
                        isSelected: child.props.value === selectedValue
                    })
                )}
            </div>
        </>
    )
}

const SelectItem = ({ className, children, onSelect, isSelected }: any) => {
    return (
        <button
            type="button"
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-xl py-2.5 pl-8 pr-2 text-sm font-bold outline-none hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors uppercase tracking-widest text-[10px]",
                className
            )}
            onClick={onSelect}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4 text-primary" />}
            </span>
            {children}
        </button>
    )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
