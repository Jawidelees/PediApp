import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
        // Basic asChild implementation logic for dependency-free baseline
        // If asChild is true, we expect the child to be a valid React element
        // and we inject the button's props into it.
        if (asChild && React.isValidElement(props.children)) {
            const child = React.Children.only(props.children) as React.ReactElement<any>;
            return React.cloneElement(child, {
                ...props,
                className: cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    variants[variant],
                    sizes[size],
                    className,
                    child.props.className
                ),
                ref: (ref as any),
            });
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)

const variants = {
    default: "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90",
    destructive: "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-500/90",
    outline: "border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
    ghost: "hover:bg-slate-100 dark:hover:bg-slate-800",
    link: "text-primary underline-offset-4 hover:underline",
}

const sizes = {
    default: "h-11 px-6 py-2",
    sm: "h-9 rounded-xl px-3 text-xs",
    lg: "h-14 rounded-2xl px-8 text-lg",
    icon: "h-10 w-10",
}

Button.displayName = "Button"

export { Button }
