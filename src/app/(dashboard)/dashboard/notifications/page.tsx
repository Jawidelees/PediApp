'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getAdminNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/actions/app-notifications';
import { toast } from 'sonner';
import LoadingIcon from '@/components/ui/LoadingIcon';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await getAdminNotifications();
            setNotifications(data);
        } catch (error) {
            toast.error('Error al cargar notificaciones');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            toast.error('Error al marcar como leída');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('Todas marcadas como leídas');
        } catch (error) {
            toast.error('Error al marcar todas como leídas');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoadingIcon />
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-white dark:bg-background-dark min-h-screen animate-fade-in pb-24">
            <header className="flex items-center bg-white dark:bg-background-dark p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 w-full">
                <div className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer">
                    <span className="material-symbols-outlined">arrow_back</span>
                </div>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 ml-2">Notificaciones</h2>
                <div className="flex w-10 items-center justify-end">
                    <button onClick={handleMarkAllAsRead} className="flex items-center justify-center rounded-full size-10 text-primary hover:bg-primary/10 transition-all">
                        <span className="material-symbols-outlined">done_all</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                                className={cn(
                                    "p-4 rounded-2xl border transition-all flex gap-4 relative overflow-hidden",
                                    notif.read
                                        ? "bg-white dark:bg-slate-900/20 border-slate-100 dark:border-slate-800 opacity-70"
                                        : "bg-primary/5 border-primary/20 shadow-sm"
                                )}
                            >
                                {!notif.read && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                )}

                                <div className={cn(
                                    "size-12 rounded-xl flex items-center justify-center shrink-0",
                                    notif.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' :
                                        notif.type === 'ERROR' ? 'bg-rose-100 text-rose-600' :
                                            notif.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                                                'bg-primary/10 text-primary'
                                )}>
                                    <span className="material-symbols-outlined">
                                        {notif.type === 'SUCCESS' ? 'check_circle' :
                                            notif.type === 'ERROR' ? 'error' :
                                                notif.type === 'WARNING' ? 'warning' :
                                                    'notifications'}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{notif.title}</h3>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {format(new Date(notif.createdAt), 'HH:mm', { locale: es })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">{notif.message}</p>

                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                            {format(new Date(notif.createdAt), "d 'de' MMMM", { locale: es })}
                                        </span>
                                        {notif.link && (
                                            <a href={notif.link} className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1">
                                                <span>VER DETALLES</span>
                                                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300 opacity-50">
                            <span className="material-symbols-outlined text-6xl mb-4">notifications_off</span>
                            <p className="text-sm font-bold uppercase tracking-[0.2em]">Todo al día</p>
                            <p className="text-xs font-medium">No tienes notificaciones pendientes</p>
                        </div>
                    )}
                </div>

                {/* Categories Tab (Stitch-like) */}
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-xs bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-1 flex shadow-2xl z-20">
                    <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-white rounded-xl shadow-lg shadow-primary/20">Todas</button>
                    <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Citas</button>
                    <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Pagos</button>
                </div>
            </main>
        </div>
    );
}
