'use client';

import React from 'react';
import { Bell, Search, Menu, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationBell from './NotificationBell';

interface HeaderProps {
    title?: string;
    onMenuToggle?: () => void;
}

export default function Header({ title, onMenuToggle }: HeaderProps) {
    const [isDark, setIsDark] = React.useState(false);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuToggle}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
                >
                    <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Page title */}
                {title && (
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h1>
                )}
            </div>

            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-transparent focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none w-40 lg:w-56"
                    />
                </div>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
                >
                    {isDark ? (
                        <Sun className="w-5 h-5 text-amber-400" />
                    ) : (
                        <Moon className="w-5 h-5 text-gray-500" />
                    )}
                </button>

                {/* Notifications */}
                <NotificationBell />
            </div>
        </header>
    );
}
