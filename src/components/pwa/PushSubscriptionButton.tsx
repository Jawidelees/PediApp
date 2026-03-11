'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PushSubscriptionButton({ className }: { className?: string }) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSupported, setIsSupported] = useState(false);
    const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem('push-notifications-dismissed');
        if (dismissed) setIsDismissed(true);

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermissionState(Notification.permission);

            const checkSubscription = async () => {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    const subscription = await registration.pushManager.getSubscription();
                    setIsSubscribed(!!subscription);
                } catch (error) {
                    console.error('Error checking subscription', error);
                } finally {
                    setIsLoading(false);
                }
            };

            checkSubscription();
        } else {
            setIsLoading(false);
        }
    }, []);

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error('Error checking subscription', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            const permission = await Notification.requestPermission();
            setPermissionState(permission);
            if (permission !== 'granted') {
                // If it's already denied, alert won't show again normally, but we handle it in UI
                setIsLoading(false);
                return;
            }

            const registration = await navigator.serviceWorker.ready;

            // Get Public Key from env
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                console.error('VAPID public key not found');
                setIsLoading(false);
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });

            // Send to our backend
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription),
            });

            if (response.ok) {
                setIsSubscribed(true);
            } else {
                console.error('Failed to save subscription');
            }
        } catch (error) {
            console.error('Failed to subscribe:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSupported) {
        return (
            <div className="bg-red-50 dark:bg-red-900/10 p-2 rounded-xl border border-red-100 dark:border-red-900/30">
                <p className="text-[9px] text-red-600 dark:text-red-400 font-bold uppercase text-center">
                    Navegador No Compatible con Push
                </p>
            </div>
        );
    }

    if (permissionState === 'denied') {
        return (
            <div className={cn("bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col gap-1.5", className)}>
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <BellOff className="w-4 h-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Avisos Bloqueados</p>
                </div>
                <p className="text-[9px] text-red-500/80 leading-tight">
                    El permiso fue denegado. Haz clic en el 🔒 al lado de la URL para activarlas.
                </p>
            </div>
        );
    }


    // ... handleSubscribe remains same but we can add a check ...

    if (isDismissed && !isSubscribed) return null;

    return (
        <div className="relative group">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isSubscribed) handleSubscribe();
                }}
                disabled={isLoading || isSubscribed}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all",
                    isSubscribed
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/50 cursor-default"
                        : "bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/20 active:scale-95",
                    className
                )}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSubscribed ? (
                    <Bell className="w-4 h-4" />
                ) : (
                    <BellOff className="w-4 h-4" />
                )}

                <div className="flex flex-col items-start leading-none gap-1">
                    <span>{isLoading ? 'Verificando...' : isSubscribed ? 'Alertas Activas ✅' : 'Activar Banners Nativos'}</span>
                    {!isSubscribed && !isLoading && (
                        <span className="text-[8px] opacity-70 font-medium normal-case tracking-normal">Recibe avisos incluso con la app cerrada</span>
                    )}
                </div>
            </button>
            {!isSubscribed && !isLoading && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsDismissed(true);
                        localStorage.setItem('push-notifications-dismissed', 'true');
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-full flex items-center justify-center text-[10px] text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    ×
                </button>
            )}
        </div>
    );
}
