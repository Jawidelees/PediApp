"use client"

import * as React from "react"

export function useToast() {
    const toast = ({ title, description, variant }: { title?: string, description?: string, variant?: 'default' | 'destructive' }) => {
        // Basic implementation that logs to console and shows alert for now
        // In a full implementation we would use a context provider
        console.log(`[TOAST] ${variant === 'destructive' ? '❌' : '✅'} ${title}: ${description}`);
        if (typeof window !== 'undefined') {
            // Fallback to native alert if no toast provider is found
            // This prevents the app from crashing while still giving feedback
            alert(`${title}\n${description}`);
        }
    }

    return {
        toast,
    }
}
