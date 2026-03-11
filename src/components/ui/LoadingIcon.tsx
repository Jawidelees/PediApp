'use client';

export default function LoadingIcon({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="relative w-12 h-12">
                {/* Animated stethoscope pulse */}
                <svg
                    viewBox="0 0 24 24"
                    className="w-full h-full text-sky-500 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M4.8 2.3A2 2 0 0 0 3 4.5v5a7 7 0 0 0 7 7h2a7 7 0 0 0 7-7v-5a2 2 0 0 0-1.8-2.2" />
                    <path d="M8 2v2" />
                    <path d="M16 2v2" />
                    <circle cx="12" cy="18" r="2" />
                    <path d="M12 20v2" />
                </svg>
                {/* Spinning ring */}
                <div className="absolute inset-0 border-2 border-sky-200 dark:border-sky-800 border-t-sky-500 dark:border-t-sky-400 rounded-full animate-spin" />
            </div>
        </div>
    );
}
