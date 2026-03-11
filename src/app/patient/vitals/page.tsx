'use client';

import React from 'react';
import { Activity, Heart, Thermometer, Droplets, LineChart, Brain, History, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VitalsPage() {
    const vitals = [
        { label: 'Ritmo Cardíaco', value: '72', unit: 'bpm', icon: <Heart className="w-5 h-5 text-red-500" />, color: 'bg-red-50 dark:bg-red-950/20', status: 'Normal' },
        { label: 'Temperatura', value: '36.5', unit: '°C', icon: <Thermometer className="w-5 h-5 text-orange-500" />, color: 'bg-orange-50 dark:bg-orange-950/20', status: 'Normal' },
        { label: 'Presión Arterial', value: '120/80', unit: 'mmHg', icon: <Activity className="w-5 h-5 text-blue-500" />, color: 'bg-blue-50 dark:bg-blue-950/20', status: 'Normal' },
        { label: 'Oxígeno', value: '98', unit: '%', icon: <Droplets className="w-5 h-5 text-cyan-500" />, color: 'bg-cyan-50 dark:bg-cyan-950/20', status: 'Normal' },
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estado de Salud</h1>
                    <p className="text-sm text-gray-500 mt-1">Tus signos vitales y análisis predictivo.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold ring-1 ring-brand-500/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    IA Activa
                </div>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {vitals.map((v) => (
                    <div key={v.label} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                        <div className={cn("inline-flex p-2 rounded-xl mb-3", v.color)}>
                            {v.icon}
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{v.label}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-gray-900 dark:text-white">{v.value}</span>
                                <span className="text-xs text-gray-500">{v.unit}</span>
                            </div>
                            <span className="text-[10px] text-emerald-500 font-bold">{v.status}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Insight Section */}
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 text-white shadow-glow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                    <div className="p-3 bg-white/20 rounded-2xl">
                        <Brain className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold">Resumen de Bienestar AI</h3>
                        <p className="text-sm text-white/80 leading-relaxed">
                            Basado en tus últimas 3 citas y signos vitales, tu recuperación post-tratamiento es del **92%**.
                            Sigue hidratándote y mantén tu próxima cita de control el siguiente mes.
                        </p>
                        <button className="text-sm font-bold bg-white text-brand-600 px-4 py-2 rounded-xl mt-2 transition-transform active:scale-95 shadow-sm">
                            Ver Análisis Detallado
                        </button>
                    </div>
                </div>
            </div>

            {/* Charts Placeholder */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <LineChart className="w-4 h-4 text-brand-500" />
                        Tendencia Semanal
                    </h3>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-brand-500" />
                        <div className="w-3 h-3 rounded-full bg-gray-200" />
                    </div>
                </div>
                <div className="h-48 w-full bg-gray-50 dark:bg-zinc-950 rounded-xl flex items-center justify-center border border-dashed border-gray-200 dark:border-zinc-800">
                    <div className="flex flex-col items-center gap-2">
                        <History className="w-8 h-8 text-gray-300" />
                        <p className="text-sm text-gray-400">Gráficas de evolución en desarrollo...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
