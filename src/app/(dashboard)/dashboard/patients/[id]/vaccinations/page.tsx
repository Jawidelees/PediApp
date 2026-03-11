'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPatientDetails } from '@/actions/patient';
import { upsertVaccinationRecord } from '@/actions/pediatric-records';
import { cn, calculateAge } from '@/lib/utils';
import { toast } from 'sonner';
import LoadingIcon from '@/components/ui/LoadingIcon';
import { VaccineStatus } from '@prisma/client';

export default function VaccinationsPage() {
    const params = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'APPLIED' | 'PENDING' | 'OVERDUE'>('ALL');

    const fetchDetails = useCallback(async () => {
        if (params.id) {
            setIsLoading(true);
            try {
                const data = await getPatientDetails(params.id as string);
                setPatient(data);
            } catch (error) {
                toast.error('Error al cargar datos');
            } finally {
                setIsLoading(false);
            }
        }
    }, [params.id]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleApplyVaccine = async (vaccineName: string, dose: string) => {
        try {
            toast.loading('Registrando aplicación...', { id: 'vaccine' });
            const res = await upsertVaccinationRecord({
                patientId: patient.id,
                vaccineName,
                dose,
                status: 'APPLIED',
                appliedDate: new Date().toISOString(),
            });

            if (res.success) {
                toast.success('Vacuna aplicada con éxito', { id: 'vaccine' });
                fetchDetails();
            } else {
                toast.error(res.error, { id: 'vaccine' });
            }
        } catch (error) {
            toast.error('Error de conexión', { id: 'vaccine' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoadingIcon />
            </div>
        );
    }

    if (!patient) return null;

    const ageInMonths = 6; // Simulado para el diseño de Stitch o calculado
    const completionRate = 85;

    const filteredVaccines = (patient.vaccinations || []).filter((v: any) => {
        const matchesSearch = v.vaccineName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'ALL' || v.status === filter;
        return matchesSearch && matchesFilter;
    });

    const categories = [
        { id: 'NEWBORN', label: 'Recién Nacido', range: [0, 0] },
        { id: '2MONTHS', label: '2 Meses', range: [2, 2] },
        { id: '4MONTHS', label: '4 Meses', range: [4, 4] },
        { id: '6MONTHS', label: '6 Meses', range: [6, 6] },
    ];

    return (
        <div className="flex flex-col bg-white dark:bg-background-dark min-h-screen animate-fade-in pb-24 text-slate-900 dark:text-slate-100">
            <header className="flex items-center bg-white dark:bg-background-dark p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 w-full">
                <button onClick={() => router.back()} className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 ml-2 text-center mr-10">Esquema de Vacunación</h2>
            </header>

            <main className="flex-1 overflow-x-hidden">
                {/* Patient Profile Header (Stitch Style) */}
                <section className="p-6 flex items-center gap-6">
                    <div className="size-20 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-primary text-3xl font-black shadow-xl shrink-0">
                        {patient.user.name[0]}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none mb-1">{patient.user.name}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">{calculateAge(patient.birthDate)} Años • A+ Sancre</p>
                        <div className="flex items-center gap-1.5 mt-2 bg-emerald-50 dark:bg-emerald-950/30 w-fit px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/20">
                            <span className="material-symbols-outlined text-[14px] text-emerald-600 font-black">verified</span>
                            <p className="text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">{completionRate}% Completado</p>
                        </div>
                    </div>
                </section>

                {/* Search & Filters (Stitch Style) */}
                <div className="px-4 py-2 sticky top-[72px] bg-white/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                    <div className="flex w-full items-stretch rounded-2xl h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 overflow-hidden group focus-within:border-primary transition-all">
                        <div className="text-slate-400 flex items-center justify-center pl-4 bg-transparent">
                            <span className="material-symbols-outlined text-xl group-focus-within:text-primary transition-colors">search</span>
                        </div>
                        <input
                            className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 px-4 text-sm font-medium"
                            placeholder="Buscar vacuna (BCG, Rotavirus...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                        {(['ALL', 'APPLIED', 'PENDING', 'OVERDUE'] as const).map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setFilter(opt)}
                                className={cn(
                                    "flex h-9 shrink-0 items-center justify-center px-5 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                                    filter === opt ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                )}
                            >
                                {opt === 'ALL' ? 'Todas' : opt === 'APPLIED' ? 'Aplicadas' : opt === 'PENDING' ? 'Próximas' : 'Vencidas'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Vaccination Timeline */}
                <div className="flex flex-col gap-8 p-4 pt-6">
                    {categories.map((cat) => (
                        <div key={cat.id}>
                            <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-1">{cat.label}</h3>
                            <div className="space-y-4">
                                {filteredVaccines.length > 0 ? (
                                    filteredVaccines.map((v: any) => (
                                        <div
                                            key={v.id}
                                            className={cn(
                                                "flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300",
                                                v.status === 'APPLIED'
                                                    ? "bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 shadow-sm opacity-80"
                                                    : "bg-primary/5 border-primary/20 shadow-md scale-[1.02]"
                                            )}
                                        >
                                            <div className={cn(
                                                "size-12 rounded-full flex items-center justify-center shrink-0 transition-transform duration-500",
                                                v.status === 'APPLIED' ? "bg-emerald-100 text-emerald-600" : "bg-primary/20 text-primary animate-pulse"
                                            )}>
                                                <span className="material-symbols-outlined font-black">
                                                    {v.status === 'APPLIED' ? 'check_circle' : 'schedule'}
                                                </span>
                                            </div>

                                            <div className="flex-1">
                                                <p className="text-slate-900 dark:text-slate-100 font-black text-base leading-none mb-1">{v.vaccineName}</p>
                                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">{v.dose} • {v.notes || 'Inmunización'}</p>
                                            </div>

                                            <div className="text-right flex flex-col items-end gap-1">
                                                <p className="text-slate-900 dark:text-slate-100 font-black text-[10px] uppercase">
                                                    {v.status === 'APPLIED' ? (v.appliedDate ? new Date(v.appliedDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '---') : 'HOY'}
                                                </p>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                    v.status === 'APPLIED' ? "bg-emerald-50 text-emerald-600" : "bg-primary text-white"
                                                )}>
                                                    {v.status === 'APPLIED' ? 'APLICADA' : 'PENDIENTE'}
                                                </span>
                                                {v.status !== 'APPLIED' && (
                                                    <button
                                                        onClick={() => handleApplyVaccine(v.vaccineName, v.dose)}
                                                        className="mt-1 text-[9px] font-black text-primary underline uppercase tracking-tighter"
                                                    >
                                                        Registrar Ahora
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center opacity-30">
                                        <p className="text-[10px] font-black uppercase tracking-widest">Sin registros en esta etapa</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State / Add New (ASIP: Functional Improvement) */}
                <div className="px-4 pb-12">
                    <button className="w-full py-5 border-2 border-dashed border-primary/30 rounded-3xl text-primary flex items-center justify-center gap-3 hover:bg-primary/5 transition-all group">
                        <span className="material-symbols-outlined text-2xl group-hover:scale-125 transition-transform">add_circle</span>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Registrar Vacuna Extra-esquema</span>
                    </button>
                    <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-3 mb-2 text-primary">
                            <span className="material-symbols-outlined">info</span>
                            <p className="text-[10px] font-black uppercase tracking-widest">Recordatorio ASIP</p>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                            El sistema sugiere que el paciente Leo Thompson está listo para recibir el primer refuerzo de Pentavalente la próxima semana. ¿Desea programar recordatorio?
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
