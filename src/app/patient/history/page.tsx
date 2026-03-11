/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { getPatientProfile } from '@/actions/patient';
import LoadingIcon from '@/components/ui/LoadingIcon';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function MisPrimerosDiasPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getPatientProfile();
                setProfile(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingIcon />
            </div>
        );
    }

    const latestGrowth = profile?.growthRecords?.[0] || { weightKg: 3.450, heightCm: 51.5 };

    return (
        <div className="flex flex-col bg-white dark:bg-slate-950 min-h-screen pb-24 animate-fade-in">
            {/* Header */}
            <header className="flex items-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-20 w-full font-black">
                <button onClick={() => router.back()} className="text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined font-black">arrow_back</span>
                </button>
                <div className="ml-4 flex-1 text-center pr-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Diario del Bebé</p>
                    <h2 className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-[0.1em]">Mis Primeros Días</h2>
                </div>
            </header>

            <main className="flex-1 space-y-8 p-6">
                {/* Hero Section / Digital Birth Card (Stitch Premium) */}
                <section>
                    <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary to-primary-dark p-8 text-white shadow-2xl shadow-primary/20 group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                            <span className="material-symbols-outlined text-9xl">card_membership</span>
                        </div>

                        <div className="flex flex-col items-center text-center gap-4 relative z-10">
                            <div className="size-32 rounded-[2.5rem] border-4 border-white/30 p-1 shadow-2xl overflow-hidden bg-white/10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <img alt="Bebé" className="w-full h-full rounded-[2rem] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCo6pQzebBrQEyYjR6Rr9RD_uNdTCEIcR4QFdUVIwFMTcd2R4yGKX6mzkQwGkFKmx6kRwqjfzDW9_3ZiLNa1YwVZSYhs-Z9sEZCSHIrrSnAgSgCn95zP44Fop2wcNY_k7pfdNUi769Cc4CyMVaFIBmIm_g_epDe9pLS7hPzO1yCZ7sB9IpDpcGh9zsxDq-IJ8CC7ZZVDyaiPwybeqqjUikgrYxX1u3sAqZv0MRZLYVVEcMAgYSQH8wmwXyxRO18SSeOSvWHQ0A8XMBP" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tighter uppercase">{profile?.user?.name || "Mateo Nicolás"}</h1>
                                <p className="text-xs font-bold text-white/70 uppercase tracking-[0.2em] mt-1">Nacido el 15 de Octubre, 2023</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full mt-6">
                                <div className="bg-white/10 backdrop-blur-md p-5 rounded-[1.8rem] border border-white/20 flex flex-col items-center">
                                    <span className="material-symbols-outlined text-white text-2xl font-black mb-1">monitor_weight</span>
                                    <p className="text-[9px] text-white/60 font-black uppercase tracking-widest">Peso al nacer</p>
                                    <p className="font-black text-xl">{latestGrowth.weightKg} kg</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-5 rounded-[1.8rem] border border-white/20 flex flex-col items-center">
                                    <span className="material-symbols-outlined text-white text-2xl font-black mb-1">straighten</span>
                                    <p className="text-[9px] text-white/60 font-black uppercase tracking-widest">Talla al nacer</p>
                                    <p className="font-black text-xl">{latestGrowth.heightCm} cm</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Checklist Section (ASIP Premium) */}
                <section className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 pl-2">
                        <span className="material-symbols-outlined text-lg text-primary">verified</span>
                        Checklist del Bebé
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-800 transition-all hover:border-emerald-500/30 group">
                            <div className="size-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-xl font-black">done_all</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none line-through opacity-50">Curación del cordón</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Realizado hoy 09:00 AM</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-800 transition-all hover:border-primary/30 group">
                            <div className="size-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                <span className="material-symbols-outlined text-xl font-black">bathtub</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">Primer baño en casa</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Preparar agua tibia (37°C)</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-200">circle</span>
                        </div>

                        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-800 transition-all hover:border-primary/30 group">
                            <div className="size-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                <span className="material-symbols-outlined text-xl font-black">thermostat</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">Control de temperatura</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Dos veces al día • 36.5°C normal</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-200">circle</span>
                        </div>
                    </div>
                </section>

                {/* Daily Vital Stats Summary */}
                <section className="pb-12">
                    <div className="bg-slate-900 dark:bg-white p-8 rounded-[2.5rem] text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                            <span className="material-symbols-outlined text-8xl text-primary font-black">assessment</span>
                        </div>
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <h4 className="text-xl font-black uppercase tracking-tighter">Resumen Diario</h4>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Día 4 • 18 Octubre</p>
                            </div>
                            <div className="bg-primary px-4 py-1.5 rounded-full">
                                <span className="text-[10px] font-black uppercase text-white tracking-widest leading-none">Excelente</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 relative z-10">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Tomas</p>
                                <p className="text-2xl font-black">8</p>
                                <div className="h-1 w-8 bg-primary rounded-full"></div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Pañales</p>
                                <p className="text-2xl font-black">6</p>
                                <div className="h-1 w-8 bg-primary rounded-full"></div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Sueño</p>
                                <p className="text-2xl font-black">14<span className="text-sm">h</span></p>
                                <div className="h-1 w-8 bg-primary rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
