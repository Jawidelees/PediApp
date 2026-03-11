'use client';

import { cn } from '@/lib/utils';

export default function PediatricLogo({ className = 'w-8 h-8', spinning = false }: { className?: string, spinning?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={cn(className, spinning && "animate-spin-slow")}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Stethoscope */}
            <path d="M4.8 2.3A2 2 0 0 0 3 4.5v5a7 7 0 0 0 7 7h2a7 7 0 0 0 7-7v-5a2 2 0 0 0-1.8-2.2" />
            <path d="M8 2v2" />
            <path d="M16 2v2" />
            <circle cx="12" cy="18" r="2" />
            <path d="M12 20v2" />
        </svg>
    );
}
