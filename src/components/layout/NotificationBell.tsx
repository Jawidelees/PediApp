/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '@/actions/app-notifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PushSubscriptionButton } from '../pwa/PushSubscriptionButton';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    link?: string | null;
    read: boolean;
    createdAt: Date;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);

    const playNotificationSound = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Audio play failed (blocked by browser):', e));
        } catch (e) {
            console.error('Error playing sound:', e);
        }
    };

    const fetchNotifications = async (isInitial = false) => {
        try {
            const data = await getUserNotifications();
            const parsedData = data.map((n: any) => ({
                ...n,
                createdAt: new Date(n.createdAt)
            }));

            const newUnreadCount = parsedData.filter((n: Notification) => !n.read).length;

            // Si el conteo de no leídos aumentó y no es la carga inicial, sonar
            if (!isInitial && newUnreadCount > unreadCount) {
                playNotificationSound();
            }

            setNotifications(parsedData);
            setUnreadCount(newUnreadCount);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(true);
        const interval = setInterval(() => fetchNotifications(false), 30000); // Fallback poll

        // Real-time sync via BroadcastChannel
        const bc = new BroadcastChannel('notifications');
        bc.onmessage = (event) => {
            if (event.data && event.data.type === 'PUSH_RECEIVED') {
                console.log('Real-time notification received via SW');
                fetchNotifications(false);
            }
        };

        return () => {
            clearInterval(interval);
            bc.close();
        };
    }, []);

    const enableSound = () => {
        // "Unlock" audio context on first interaction
        setIsSoundEnabled(true);
        playNotificationSound(); // Play once to confirm
    };

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent clicking the notification itself if it has a link

        // Optimistic UI update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        await markNotificationAsRead(id);
    };

    const handleMarkAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        await markAllNotificationsAsRead();
    };

    return (
        <div className="relative z-50">
            {/* Bell Icon Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-md transition-all group"
            >
                <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:rotate-12 transition-transform duration-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-500 items-center justify-center text-[9px] font-black text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Invisible backdrop to close on click outside */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                                Notificaciones
                                {unreadCount > 0 && (
                                    <span className="bg-brand-500 text-white py-0.5 px-2 rounded-full text-[10px] font-black shadow-sm">
                                        {unreadCount} nuevas
                                    </span>
                                )}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Push Opt-in & Sound Unlock Section */}
                        <div className="p-3 border-b border-gray-100 dark:border-zinc-800 bg-orange-50/30 dark:bg-orange-900/10 space-y-3">
                            <div className="flex flex-col gap-2">
                                <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest px-1">
                                    Alertas Nativa (Banners)
                                </p>
                                <PushSubscriptionButton className="w-full justify-center py-2.5 shadow-sm" />
                            </div>

                            {!isSoundEnabled && (
                                <button
                                    onClick={enableSound}
                                    className="w-full py-2 px-3 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-brand-100 dark:border-brand-900/30 transition-all flex items-center justify-center gap-2"
                                >
                                    🔔 Activar Sonido de Alertas
                                </button>
                            )}
                        </div>

                        {/* Actions */}
                        {unreadCount > 0 && (
                            <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-[10px] font-bold text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                >
                                    <Check className="w-3 h-3" />
                                    Marcar todas como leídas
                                </button>
                            </div>
                        )}

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto overscroll-contain">
                            {isLoading ? (
                                <div className="p-8 text-center text-sm text-gray-400 animate-pulse">
                                    Cargando...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-10 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                                        <Bell className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        No hay notificaciones nuevas
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Te avisaremos cuando haya actividad relevante.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "p-4 transition-all duration-300 relative group overflow-hidden",
                                                !notification.read
                                                    ? "bg-brand-50/40 dark:bg-brand-900/20 hover:bg-brand-50/60 dark:hover:bg-brand-900/30"
                                                    : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                                            )}
                                        >
                                            <div className="flex gap-3 relative z-10">
                                                {/* Unread indicator */}
                                                <div className="mt-1.5 shrink-0">
                                                    {!notification.read ? (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-500),0.5)]" />
                                                    ) : (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 pr-6">
                                                    <p className={cn(
                                                        "text-sm font-extrabold truncate",
                                                        !notification.read ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"
                                                    )}>
                                                        {notification.title}
                                                    </p>
                                                    <p className={cn(
                                                        "text-xs mt-0.5 line-clamp-2",
                                                        !notification.read ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-500 dark:text-slate-400"
                                                    )}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
                                                        {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: es })}
                                                    </p>
                                                </div>

                                                {/* Mark as read button (visible on hover) */}
                                                {!notification.read && (
                                                    <button
                                                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                        className="absolute top-1/2 -translate-y-1/2 right-4 p-2 rounded-full text-brand-600 bg-white dark:bg-slate-800 shadow-md opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300"
                                                        title="Marcar como leída"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
