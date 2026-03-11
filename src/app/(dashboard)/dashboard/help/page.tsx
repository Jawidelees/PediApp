'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import LoadingIcon from '@/components/ui/LoadingIcon';

export default function HelpSupportPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { id: 'citas', title: 'Citas', desc: 'Agendar, cancelar y recordatorios', icon: 'calendar_month' },
        { id: 'vacunas', title: 'Vacunas', desc: 'Esquema nacional y dosis', icon: 'vaccines' },
        { id: 'facturas', title: 'Facturación', desc: 'Pagos, seguros y boletas', icon: 'receipt_long' },
        { id: 'telemedicina', title: 'Telemedicina', desc: 'Consultas por videollamada', icon: 'medical_information' },
    ];

    const contactChannels = [
        { title: 'WhatsApp', desc: 'Respuesta rápida', icon: 'chat', color: 'bg-green-100 text-green-600' },
        { title: 'Llamada telefónica', desc: 'Lunes a Sábado, 8am - 8pm', icon: 'call', color: 'bg-blue-100 text-blue-600' },
        { title: 'Correo Electrónico', desc: 'soporte@pediacare.com', icon: 'mail', color: 'bg-slate-100 text-slate-600' },
    ];

    return (
        <div className="flex flex-col bg-white dark:bg-background-dark min-h-screen animate-fade-in pb-24 text-slate-900 dark:text-slate-100">
            <header className="flex items-center bg-white dark:bg-background-dark p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 w-full">
                <div className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer">
                    <span className="material-symbols-outlined">arrow_back</span>
                </div>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 ml-2">Ayuda y Soporte</h2>
            </header>

            <main className="flex-1 overflow-y-auto">
                {/* Hero Section */}
                <div className="px-4 py-8 bg-gradient-to-b from-primary/10 to-transparent">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2 text-center">¡Hola! 👋</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-center mb-8 font-medium">¿En qué podemos ayudar a tu pequeño hoy?</p>

                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="flex w-full items-stretch rounded-2xl h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-primary/5 group-focus-within:border-primary transition-all overflow-hidden text-slate-900 dark:text-slate-100">
                            <div className="text-slate-400 flex items-center justify-center pl-4 bg-white dark:bg-slate-800">
                                <span className="material-symbols-outlined text-2xl group-focus-within:text-primary transition-colors">search</span>
                            </div>
                            <input
                                className="w-full bg-white dark:bg-slate-800 border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 px-4 text-base font-medium"
                                placeholder="Consultas, pagos, vacunas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* FAQ Categories */}
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold tracking-tight">Categorías Populares</h3>
                        <span className="text-primary text-sm font-bold bg-primary/10 px-3 py-1 rounded-full">Ver todas</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer group">
                                <div className="bg-primary/10 text-primary w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                    <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                                </div>
                                <div>
                                    <h2 className="text-slate-900 dark:text-slate-100 text-base font-bold mb-1">{cat.title}</h2>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{cat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Support */}
                <div className="px-4 py-8">
                    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
                        <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold mb-2 text-center">¿Aún tienes dudas?</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm text-center mb-8 font-medium">Estamos aquí para cuidarte. Contáctanos por el canal de tu preferencia.</p>

                        <div className="space-y-4">
                            {contactChannels.map((channel, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="flex items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-primary/20 transition-all group"
                                >
                                    <div className={cn("size-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110", channel.color)}>
                                        <span className="material-symbols-outlined text-2xl">{channel.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">{channel.title}</p>
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{channel.desc}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Helpful Tip */}
                <div className="px-4 pb-10">
                    <div className="bg-primary text-white p-6 rounded-[2rem] flex items-center gap-5 shadow-xl shadow-primary/20">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <span className="material-symbols-outlined text-3xl">lightbulb</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold mb-1 italic">Tip del Día</p>
                            <p className="text-xs text-white/90 leading-relaxed font-medium">¿Sabías que puedes recibir tus resultados de laboratorio directamente en tu celular? ¡Activa las notificaciones!</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
