'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

const patientNavItems = [
    { label: 'Inicio', href: '/patient', icon: 'home' },
    { label: 'Salud', href: '/patient/history', icon: 'ecg_heart' },
    { label: 'Medicamento', href: '/patient/meds', icon: 'prescriptions' },
    { label: 'Más', href: '/patient/profile', icon: 'menu' },
];

export default function PatientMobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex justify-between items-center z-40 safe-bottom">
            {patientNavItems.map((item, index) => {
                const isActive = pathname === item.href || (item.href !== '/patient' && pathname.startsWith(item.href));

                if (index === 2) {
                    // Render Chat button before the 3rd item
                    return (
                        <div key="chat-button" className="contents">
                            <div className="relative -top-6">
                                <button className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 ring-4 ring-background-light dark:ring-background-dark active:scale-95 transition-transform" onClick={() => alert('Chat functionality coming soon!')}>
                                    <span className="material-symbols-outlined !text-[32px]">chat_bubble</span>
                                </button>
                            </div>
                            <Link
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center gap-1 transition-all duration-200',
                                    isActive ? 'text-primary' : 'text-slate-400'
                                )}
                            >
                                <span className={cn("material-symbols-outlined !text-[26px]", isActive && "fill-current")}>{item.icon}</span>
                                <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
                            </Link>
                        </div>
                    );
                }

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex flex-col items-center gap-1 transition-all duration-200',
                            isActive ? 'text-primary' : 'text-slate-400'
                        )}
                    >
                        <span className={cn("material-symbols-outlined !text-[26px]", isActive && "fill-current")}>{item.icon}</span>
                        <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

