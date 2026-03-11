'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone === true);

        if (isIosDevice && !isStandalone) {
            setIsIOS(true);
            setSupportsPWA(true);
            // Show prompt after delay
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }

        // Standard Android/Desktop check
        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);

            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        };

        window.addEventListener('beforeinstallprompt', handler);

        if (isStandalone) {
            setSupportsPWA(false);
            setIsVisible(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!promptInstall) return;
        promptInstall.prompt();
    };

    if (!isVisible || !supportsPWA) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:bottom-8 md:right-8 md:left-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-brand-950 border border-gold-500/30 rounded-3xl p-5 shadow-2xl shadow-gold-500/20 backdrop-blur-xl flex flex-col md:flex-row items-center gap-5 max-w-sm border-b-4 border-b-gold-600/50">
                <div className="flex w-full items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex-shrink-0 flex items-center justify-center shadow-lg border border-gold-400/50">
                        <Download className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Instalar App Pediatría</h4>
                        {isIOS ? (
                            <p className="text-[11px] text-brand-200/90 leading-tight mt-0.5">
                                Toca Compartir <Share className="inline w-3 h-3 mx-1" /> y luego <br />
                                <strong>&ldquo;Agregar a Inicio&rdquo;</strong>
                            </p>
                        ) : (
                            <p className="text-[11px] text-brand-200/70 truncate mt-0.5 font-medium">Acceso rápido y notificaciones.</p>
                        )}
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1.5 hover:bg-white/10 rounded-full text-brand-400 transition-colors self-start md:self-center"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {!isIOS && (
                    <div className="w-full flex justify-center mt-2 md:mt-0 md:w-auto">
                        <button
                            onClick={onClick}
                            className="w-full md:w-auto px-8 py-3 bg-gold-500 hover:bg-gold-400 text-brand-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gold-500/20"
                        >
                            Instalar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
