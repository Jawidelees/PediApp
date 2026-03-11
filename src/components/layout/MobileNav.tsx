'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const adminNavItems = [
    { label: 'Agenda', href: '/dashboard/appointments', icon: 'calendar_today' },
    { label: 'Pacientes', href: '/dashboard/patients', icon: 'groups' },
    { label: 'Inventario', href: '/dashboard/inventory', icon: 'clinical_notes' },
    { label: 'Facturas', href: '/dashboard/billing', icon: 'account_balance_wallet' },
    { label: 'Ajustes', href: '/dashboard/settings', icon: 'settings' },
];

export default function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || 'ADMIN'; // Default fallback

    // Filter items based on role
    const filteredNavItems = adminNavItems.filter(item => {
        if (role === 'ADMIN') return true;
        if (role === 'DOCTOR') {
            // Doctors don't handle billing
            return item.href !== '/dashboard/billing';
        }
        if (role === 'RECEPTIONIST') {
            // Receptionists don't handle clinical inventory
            return item.href !== '/dashboard/inventory';
        }
        return false;
    });

    // Check if we are in the admin dashboard (starts with /dashboard)
    // If not, we might be in the patient dashboard, which has its own PatientMobileNav.
    if (!pathname.startsWith('/dashboard')) return null;

    return (
        <nav className="sticky bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-4 pb-6 pt-2 z-50">
            <div className="flex gap-1 max-w-lg mx-auto">
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 py-1",
                                isActive ? "text-primary" : "text-slate-400 dark:text-slate-500 hover:text-primary/70"
                            )}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                {item.icon}
                            </span>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-center">{item.label}</p>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
