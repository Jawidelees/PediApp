/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import LoadingIcon from '@/components/ui/LoadingIcon';
import Link from 'next/link';
import { getNextMilestone, getVaccineUrgency } from '@/lib/milestones';
import { cn } from '@/lib/utils';

export default function PatientDashboardPage() {
    const { data: session } = useSession();
    const [patientData, setPatientData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDetails() {
            if (!session?.user?.id) return;
            try {
                const response = await fetch('/api/patient/me');
                if (response.ok) {
                    const data = await response.json();
                    setPatientData(data);
                }
            } catch (err) {
                console.error('Error fetching patient data:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDetails();
    }, [session?.user?.id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <LoadingIcon />
            </div>
        );
    }

    const activeAppointments = patientData?.appointments?.filter((a: any) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED') || [];
    const nextMilestone = getNextMilestone(patientData?.birthDate);
    const vaccineUrgency = getVaccineUrgency(patientData?.vaccinations || []);

    const selectedChild = patientData ? {
        name: patientData.user?.name || 'Leo',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaitYHgShX_jmXMzpTo5RFvBSwlsssQwFT016aWN1Dv_cxH8RYLHx76nRBILAJPzz2pgvx-uJqbitK929Mv36Z3yVSqMch-0GWsTB_gzMoBMqCJwXUAUHNlzRT4WwBjZCl_VKslUJ12rM_jYtIxW0BlysRY_lufBsEAZE8cfh2bI40u4XaCtWb_vZuwkS_85aiGYU5QBeN73kVU5XoE8HRKDEU6659_iVrDZWJANYD3eeK3jscqn0Uq8c7kseABmSwfL1hI8AUk988'
    } : null;

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen pb-24">
            {/* Header */}
            <header className="flex items-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-6 sticky top-0 z-20 border-b border-slate-100 dark:border-slate-800">
                <div className="flex size-12 shrink-0 items-center overflow-hidden rounded-2xl shadow-lg shadow-primary/10 border-2 border-white dark:border-slate-800">
                    <img className="h-full w-full object-cover" alt="Profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHYtjRGXNAlXE4dXkEjsecZOZ_lOpBQ8aRy5TifXdUgGMq5APhFyl6QENvPpjRoAiKxmrlVpjeKEca3NMVEge7zxYEruun_YWYQcyjip3AcNfKtWM8oR8QO5xW_UQw5-8j1lknFgF_Qf5Vtm7Ny91i4jWKNwVwVQvq_S9DIUPX33W3QWDnrf7WJOnfjtOgzDyidtB-TgkPU9h52zGh7fR1o_EWiiogZzlEeF1nhJmvAOFJql3kwZp5t5-an10VKbFZP9yBG3L09b4I" />
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Padre / Tutor</p>
                    <h2 className="text-slate-900 dark:text-white text-xl font-black leading-none tracking-tight">{session?.user?.name || 'Sarah Jenkins'}</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button className="relative flex size-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:text-primary transition-all">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
                    </button>
                </div>
            </header>

            <main className="space-y-8 p-6">
                {/* Child Quick View (Premium) */}
                <section>
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Mis Pequeños</h3>
                        <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Gestionar</button>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                        <div className="flex flex-col items-center gap-3 min-w-[80px]">
                            <div className="relative group cursor-pointer">
                                <div className="size-20 rounded-[2rem] border-4 border-primary p-0.5 shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <img className="h-full w-full rounded-[1.8rem] object-cover" alt={selectedChild?.name} src={selectedChild?.avatar} />
                                </div>
                                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                                    <span className="material-symbols-outlined !text-[16px] font-black">check</span>
                                </div>
                            </div>
                            <p className="text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest">{selectedChild?.name}</p>
                        </div>

                        <div className="flex flex-col items-center gap-3 min-w-[80px] opacity-40 hover:opacity-100 transition-opacity">
                            <div className="size-20 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 p-0.5 -rotate-3 hover:rotate-0 transition-transform duration-500">
                                <img className="h-full w-full rounded-[1.8rem] object-cover" alt="Mia" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZ3I9KQeVF7-bRL6buwx7nXYXetaJTIRd2xBXMZMbZSKkVZZrHpo_A4kocX4RwXdj4ob6SXemH7pkJwzgzJPxpqceaKvGGLMOAvjyxdkK7k2_Kaed_BO0HD93keND3356UW-ls_IIJqH_akT6JEQYZMVoDgVOF8CsFZ_Q1WcuYT1NLODfbU10ltm9aXMFpijXLMLeWA3AfsQZ9NbnUA_w1DRDb1KoZdHlpLFfgzkOE7K_2yGa1UKdaYzanLXzqlnnXu4cVIrZZ7BT4" />
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Mia</p>
                        </div>

                        <div className="flex flex-col items-center gap-3 min-w-[80px]">
                            <button className="size-20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 hover:border-primary/30 hover:text-primary transition-all">
                                <span className="material-symbols-outlined text-3xl">add</span>
                            </button>
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">Añadir</p>
                        </div>
                    </div>
                </section>

                {/* Quick Navigation (ASIP Style) */}
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/patient/book" className="flex items-center gap-4 bg-primary rounded-[2rem] p-6 shadow-xl shadow-primary/20 group hover:translate-y-[-4px] transition-all overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform">
                            <span className="material-symbols-outlined text-6xl text-white">calendar_add_on</span>
                        </div>
                        <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
                            <span className="material-symbols-outlined font-black">add_circle</span>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-white leading-tight">Agendar<br />Cita</span>
                    </Link>

                    <div className="grid grid-rows-2 gap-4">
                        <Link href="/patient/history" className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 hover:border-primary/30 transition-all group">
                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">folder_shared</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 leading-none">Expediente</span>
                        </Link>
                        <Link href="/patient/vitals" className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 hover:border-primary/30 transition-all group">
                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">monitoring</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 leading-none">Signos</span>
                        </Link>
                    </div>
                </div>

                {/* Next Vaccine (ASIP: Dynamic Intelligence) */}
                <section className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Inmunización</h3>
                    {vaccineUrgency ? (
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <span className="material-symbols-outlined text-8xl">vaccines</span>
                            </div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Próxima Vacuna</p>
                                    <h4 className="text-2xl font-black tracking-tighter uppercase">{vaccineUrgency.vaccine.vaccineName}</h4>
                                </div>
                                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 text-center border border-white/20">
                                    <p className="text-[10px] uppercase font-black tracking-tight leading-none">En</p>
                                    <p className="text-xl font-black">{vaccineUrgency.daysRemaining}</p>
                                    <p className="text-[8px] uppercase font-black opacity-80">Días</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold opacity-90">{vaccineUrgency.vaccine.dose} • Al día</p>
                                <button className="bg-white text-emerald-700 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Ver Calendario</button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 text-center">
                            <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2">verified</span>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{selectedChild?.name} está al día</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Esquema nacional completado</p>
                        </div>
                    )}
                </section>

                {/* Suggested Milestone (ASIP: Dynamic Content) */}
                {nextMilestone && (
                    <section className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Hitos de Desarrollo</h3>
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm group">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="material-symbols-outlined text-4xl text-primary font-black">child_care</span>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none">{nextMilestone.title}</h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Cero a 24 Meses</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6 italic">
                                &quot;{nextMilestone.description}&quot;
                            </p>
                            <div className="space-y-3">
                                {nextMilestone.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group-hover:bg-slate-100 transition-colors">
                                        <span className="material-symbols-outlined text-lg text-primary">check_circle</span>
                                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-8 py-4 border-2 border-primary/20 rounded-[1.5rem] text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Ver todos los hitos</button>
                        </div>
                    </section>
                )}

                {/* Appointments Summary */}
                <section className="space-y-4 pb-12">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Próxima Visita</h3>
                        <Link href="/patient/history" className="text-primary text-[10px] font-black uppercase tracking-widest">Ver Todo</Link>
                    </div>
                    {activeAppointments.length > 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase">{activeAppointments[0].service?.name}</h5>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        {new Date(activeAppointments[0].date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                                <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">schedule</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-black overflow-hidden ring-2 ring-white dark:ring-slate-900">
                                    {activeAppointments[0].doctor?.user?.name[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">{activeAppointments[0].doctor?.user?.name}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Pediatría General</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-primary leading-none">{new Date(activeAppointments[0].date).toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 p-12 text-center opacity-50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No hay citas programadas</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
