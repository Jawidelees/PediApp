'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Package,
    FileText,
    Settings,
    Activity,
    ChevronLeft,
    ChevronRight,
    LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles?: string[];
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        label: 'Citas',
        href: '/dashboard/appointments',
        icon: <CalendarDays className="w-5 h-5" />,
    },
    {
        label: 'Pacientes',
        href: '/dashboard/patients',
        icon: <Users className="w-5 h-5" />,
    },
    {
        label: 'Inventario',
        href: '/dashboard/inventory',
        icon: <Package className="w-5 h-5" />,
        roles: ['ADMIN', 'DOCTOR'],
    },
    {
        label: 'Facturación',
        href: '/dashboard/billing',
        icon: <FileText className="w-5 h-5" />,
        roles: ['ADMIN', 'RECEPTIONIST'],
    },
    {
        label: 'Ajustes',
        href: '/dashboard/settings',
        icon: <Settings className="w-5 h-5" />,
        roles: ['ADMIN'],
    }
];

interface SidebarProps {
    userName?: string;
    userRole?: string;
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({
    userName: initialUserName = 'Usuario',
    userRole: initialUserRole = 'ADMIN',
    mobileOpen = false,
    setMobileOpen
}: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { data: session } = useSession();

    // Demo mode detection: swap /dashboard prefix for /demo
    const isDemo = pathname.startsWith('/demo');
    const basePath = isDemo ? '/demo' : '/dashboard';

    const userName = session?.user?.name || initialUserName;
    const userRole = (session?.user as any)?.role || initialUserRole;
    const [showMenu, setShowMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = async () => {
        if (isDemo) {
            window.location.href = '/login';
            return;
        }
        if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
        }
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <aside
            className={cn(
                'fixed inset-y-0 left-0 z-50 md:relative md:flex flex-col h-screen bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 transition-all duration-300 ease-in-out',
                collapsed ? 'md:w-[72px]' : 'md:w-[260px]',
                mobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0'
            )}
        >
            {/* Logo & Mobile Close */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400 text-white p-2 shrink-0">
                        {/* Pediatric Stethoscope SVG */}
                        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4.8 2.3A2 2 0 0 0 3 4.5v5a7 7 0 0 0 7 7h2a7 7 0 0 0 7-7v-5a2 2 0 0 0-1.8-2.2" />
                            <path d="M8 2v2" />
                            <path d="M16 2v2" />
                            <circle cx="12" cy="18" r="2" />
                            <path d="M12 20v2" />
                        </svg>
                    </div>
                    {(!collapsed || mobileOpen) && (
                        <div className="overflow-hidden">
                            <span className="text-lg font-black text-brand-900 dark:text-white uppercase tracking-tighter leading-tight">
                                Clínica <span className="font-serif italic font-medium text-sky-500 capitalize tracking-normal">Pediátrica</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Mobile Close Button */}
                {mobileOpen && (
                    <button
                        onClick={() => setMobileOpen?.(false)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    // Remap href: /dashboard -> basePath
                    const href = item.href.replace('/dashboard', basePath);
                    const isActive =
                        pathname === href ||
                        (href !== basePath && pathname.startsWith(href));

                    // In demo mode, skip items that don't have a demo page (settings, billing)
                    if (isDemo && !['/demo', '/demo/appointments', '/demo/patients', '/demo/inventory'].includes(href)) return null;

                    // Basic role check (can be expanded)
                    if (item.roles && !item.roles.includes(userRole)) return null;

                    return (
                        <Link
                            key={href}
                            href={href}
                            title={collapsed ? item.label : undefined}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
                                isActive
                                    ? 'bg-brand-50/50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 border border-brand-100/50 dark:border-brand-900/30'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900/50 hover:text-gray-900 dark:hover:text-white'
                            )}
                        >
                            <span
                                className={cn(
                                    'shrink-0 opacity-70',
                                    isActive && 'opacity-100'
                                )}
                            >
                                {item.icon}
                            </span>
                            {!collapsed && <span className="truncate uppercase tracking-wider text-[10px]">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom User Section */}
            <div className="border-t border-gray-100 dark:border-zinc-800 p-3 space-y-2">
                {/* User Profile Card */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className={cn(
                            'w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-200',
                            showMenu
                                ? 'bg-gray-100 dark:bg-zinc-800'
                                : 'hover:bg-gray-50 dark:hover:bg-zinc-900/50',
                            collapsed && 'justify-center px-1'
                        )}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
                            <span className="text-sm font-black">
                                {userName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </span>
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden flex-1 text-left">
                                <p className="text-[12px] font-bold text-gray-900 dark:text-white truncate leading-tight">
                                    {userName}
                                </p>
                                <span className={cn(
                                    'inline-flex items-center mt-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider',
                                    userRole === 'ADMIN' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                    userRole === 'DOCTOR' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                    userRole === 'RECEPTIONIST' && 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
                                )}>
                                    {userRole === 'ADMIN' ? 'Administrador' :
                                        userRole === 'DOCTOR' ? 'Pediatra' :
                                            userRole === 'RECEPTIONIST' ? 'Recepcionista' : userRole}
                                </span>
                            </div>
                        )}
                    </button>

                    {/* Popover Menu */}
                    {showMenu && (
                        <>
                            {/* Backdrop to close on click outside */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in">
                                {/* User info header */}
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{userName}</p>
                                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                        {session?.user?.email || 'Sin correo configurado'}
                                    </p>
                                </div>
                                {/* Logout button */}
                                <button
                                    onClick={() => { setShowMenu(false); setShowLogoutConfirm(true); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-xs font-bold">Cerrar Sesión</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    title={collapsed ? "Expandir" : "Colapsar"}
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Logout Confirmation Dialog */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div
                        className="bg-white dark:bg-zinc-950 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl w-full max-w-sm p-6 space-y-5 animate-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                                <LogOut className="w-7 h-7 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">¿Cerrar sesión?</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Saldrás del portal de Clínica Pediátrica.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition-all"
                            >
                                Sí, salir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}

