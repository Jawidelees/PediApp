"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PanelLeft, ChevronLeft, ChevronRight, Menu } from "lucide-react";

// simplified Sidebar implementation for the SaaS Admin Dashboard
const SidebarContext = React.createContext<{
    expanded: boolean;
    setExpanded: (val: boolean) => void;
}>({ expanded: true, setExpanded: () => { } });

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [expanded, setExpanded] = React.useState(true);
    return (
        <SidebarContext.Provider value={{ expanded, setExpanded }}>
            <div className="flex w-full min-h-screen">{children}</div>
        </SidebarContext.Provider>
    );
}

export function Sidebar({ children, className }: { children: React.ReactNode; className?: string }) {
    const { expanded } = React.useContext(SidebarContext);
    return (
        <aside
            className={cn(
                "h-screen sticky top-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col",
                expanded ? "w-64" : "w-20",
                className
            )}
        >
            {children}
        </aside>
    );
}

export function SidebarHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("p-4", className)}>{children}</div>;
}

export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1", className)}>{children}</div>;
}

export function SidebarGroup({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("py-2", className)}>{children}</div>;
}

export function SidebarMenu({ children, className }: { children: React.ReactNode; className?: string }) {
    return <ul className={cn("space-y-1", className)}>{children}</ul>;
}

export function SidebarMenuItem({ children, className }: { children: React.ReactNode; className?: string }) {
    return <li className={className}>{children}</li>;
}

export function SidebarMenuButton({
    children,
    asChild,
    className,
    active,
    ...props
}: {
    children: React.ReactNode;
    asChild?: boolean;
    className?: string;
    active?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { expanded } = React.useContext(SidebarContext);

    const buttonClass = cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold text-sm group w-full",
        active
            ? "bg-primary text-white shadow-lg shadow-primary/20"
            : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-primary",
        expanded ? "justify-start" : "justify-center",
        className
    );

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            className: cn(buttonClass, children.props.className),
            ...props,
        });
    }

    return (
        <button
            className={buttonClass}
            {...props}
        >
            {children}
        </button>
    );
}

export function SidebarTrigger() {
    const { expanded, setExpanded } = React.useContext(SidebarContext);
    return (
        <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
            <Menu className="w-5 h-5 text-slate-500" />
        </button>
    );
}
