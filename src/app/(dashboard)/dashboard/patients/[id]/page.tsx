'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPatientDetails, deletePatient } from '@/actions/patient';
import { notifyPatient } from '@/actions/notifications';
import { cn, calculateAge, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import LoadingIcon from '@/components/ui/LoadingIcon';
import Link from 'next/link';

// Componentes del Expediente
import MedicalRecordForm from '@/components/medical/MedicalRecordForm';

export default function PatientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchDetails = useCallback(async () => {
        if (params.id) {
            setIsLoading(true);
            try {
                const data = await getPatientDetails(params.id as string);
                setPatient(data);
            } catch (error) {
                toast.error('Error al cargar datos del paciente');
            } finally {
                setIsLoading(false);
            }
        }
    }, [params.id]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleDelete = async () => {
        if (!patient) return;
        if (confirm(`¿Estás seguro que deseas eliminar permanentemente a ${patient.user.name}?`)) {
            setIsDeleting(true);
            try {
                const res = await deletePatient(patient.id);
                if (res.success) {
                    toast.success('Paciente eliminado');
                    router.push('/dashboard/patients');
                } else {
                    toast.error(res.error || 'Error al eliminar');
                }
            } catch (err) {
                toast.error('Error de conexión');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoadingIcon />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <span className="material-symbols-outlined text-6xl text-slate-300">person_off</span>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Paciente no encontrado</p>
                <button onClick={() => router.back()} className="text-primary font-black text-xs uppercase tracking-widest border-b-2 border-primary pb-1">Volver</button>
            </div>
        );
    }

    const age = calculateAge(patient.birthDate);
    const lastRecord = patient.medicalRecords?.[0];
    const latestWeight = patient.growthRecords?.[0]?.weightKg || patient.birthWeight || '--';
    const latestHeight = patient.growthRecords?.[0]?.heightCm || patient.birthHeight || '--';

    return (
        <div className="flex flex-col bg-white dark:bg-background-dark min-h-screen animate-fade-in pb-24 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <header className="flex items-center bg-white dark:bg-background-dark p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 w-full backdrop-blur-md bg-white/80 dark:bg-background-dark/80">
                <button onClick={() => router.back()} className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 ml-2">Expediente Médico</h2>
                <div className="flex items-center gap-2">
                    <button className="text-slate-400 size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><span className="material-symbols-outlined">search</span></button>
                    <button className="text-slate-400 size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><span className="material-symbols-outlined">more_vert</span></button>
                </div>
            </header>

            <main className="flex-1 overflow-x-hidden">
                {/* Patient Hero Profile */}
                <section className="p-4">
                    <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800/60 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                            <div className="relative group">
                                <div className="size-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-4xl font-black group-hover:scale-105 transition-transform duration-500 overflow-hidden shadow-xl shadow-primary/10">
                                    {patient.user.name[0]}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 size-6 rounded-full border-4 border-white dark:border-slate-900"></div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">{patient.user.name}</h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                                    <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{age} Años</span>
                                    <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{patient.bloodType || 'B+'} Sangre</span>
                                    <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{latestWeight} kg</span>
                                </div>

                                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                                    {patient.allergies && (
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-800 animate-pulse">
                                            <span className="material-symbols-outlined text-sm">warning</span>
                                            ALERGIA: {patient.allergies.toUpperCase()}
                                        </div>
                                    )}
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Seguro Activo
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                                <button className="flex-1 md:w-40 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                    Editar Perfil
                                </button>
                                <button onClick={() => setShowRecordModal(true)} className="flex-1 md:w-40 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    <span className="material-symbols-outlined text-lg">medical_services</span>
                                    Nueva Consulta
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Growth & Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 mb-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* WHO Percentiles Chart (Simplified UX) */}
                        <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800/60 relative group">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-3xl">monitoring</span>
                                    Crecimiento (Percentiles OMS)
                                </h3>
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-hidden scale-90">
                                    <button className="px-5 py-2 bg-white dark:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Peso</button>
                                    <button className="px-5 py-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">Talla</button>
                                    <button className="px-5 py-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">IMC</button>
                                </div>
                            </div>

                            {/* Chart Visualization Placeholder */}
                            <div className="relative h-64 w-full bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800/50 flex flex-col justify-center items-center group-hover:border-primary/20 transition-all duration-700">
                                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="material-symbols-outlined text-[10rem] text-primary">analytics</span>
                                </div>
                                <div className="relative z-10 text-center">
                                    <p className="text-3xl font-black text-slate-400 tracking-tighter mb-2 italic">GRÁFICA INTERACTIVA</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Haga clic para ver detalles históricos</p>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <div className="flex items-center gap-2"><span className="w-4 h-1 bg-primary rounded-full"></span> Tendencia</div>
                                <div className="flex items-center gap-2"><span className="w-4 h-1 border-t-2 border-dashed border-slate-300"></span> Media OMS</div>
                                <div className="ml-auto flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                                    <span className="text-primary">ACTUAL: PERCENTIL 75</span>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Notes Summary */}
                        <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800/60">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-3xl">list_alt</span>
                                    Notas Clínicas
                                </h3>
                                <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline transition-all">Ver Historial Completo</button>
                            </div>

                            <div className="space-y-4">
                                {patient.medicalRecords?.length > 0 ? (
                                    patient.medicalRecords.slice(0, 2).map((record: any, idx: number) => (
                                        <div key={record.id} className={cn(
                                            "p-6 rounded-[2rem] border transition-all hover:translate-x-1 duration-300",
                                            idx === 0 ? "bg-primary/5 border-primary/20 shadow-sm" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/20"
                                        )}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{record.diagnosis || 'Revisión General'}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{formatDate(record.createdAt)}</span>
                                                </div>
                                                <div className="size-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm">
                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium line-clamp-2 italic">
                                                {record.notes || 'Consulta completada sin observaciones adicionales registradas.'}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-300 opacity-50 flex flex-col items-center">
                                        <span className="material-symbols-outlined text-5xl mb-3">history_edu</span>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Sin registros previos</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Vaccinations, Perinatal & Milestones */}
                    <aside className="space-y-6">
                        {/* Quick Access Grid (ASIP: Functional Navigation) */}
                        <div className="grid grid-cols-2 gap-4">
                            <Link href={`/dashboard/patients/${patient.id}/vaccinations`} className="flex flex-col items-center justify-center p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 hover:scale-[1.02] transition-all group">
                                <span className="material-symbols-outlined text-4xl text-emerald-600 mb-2 group-hover:rotate-12 transition-transform">vaccines</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900 dark:text-emerald-400">Vacunas</span>
                            </Link>
                            <Link href={`/dashboard/patients/${patient.id}/perinatal`} className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 hover:scale-[1.02] transition-all group">
                                <span className="material-symbols-outlined text-4xl text-blue-600 mb-2 group-hover:scale-110 transition-transform">child_care</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-900 dark:text-blue-400">Perinatal</span>
                            </Link>
                            <Link href={`/dashboard/patients/${patient.id}/prescription`} className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:scale-[1.02] transition-all group">
                                <span className="material-symbols-outlined text-4xl text-slate-600 mb-2 group-hover:translate-y-1 transition-transform">medication</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400">Receta</span>
                            </Link>
                            <button onClick={handleDelete} className="flex flex-col items-center justify-center p-6 bg-rose-50 dark:bg-rose-950/20 rounded-[2rem] border border-rose-100 dark:border-rose-900/30 hover:scale-[1.02] transition-all group">
                                <span className="material-symbols-outlined text-4xl text-rose-600 mb-2 group-hover:shake transition-transform">delete_sweep</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-900 dark:text-rose-400">Eliminar</span>
                            </button>
                        </div>

                        {/* Recent Vitals Card */}
                        <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800/60">
                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-primary">vital_signs</span>
                                Signos Vitales
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <span className="material-symbols-outlined text-lg">weight</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Peso</p>
                                            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{latestWeight} kg</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-emerald-500 font-black">trending_up</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <span className="material-symbols-outlined text-lg">height</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Talla</p>
                                            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{latestHeight} cm</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-emerald-500 font-black">trending_up</span>
                                </div>
                            </div>
                        </div>

                        {/* Next Actions Card (ASIP Intelligence) */}
                        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <span className="material-symbols-outlined text-8xl">child_friendly</span>
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined">rocket_launch</span>
                                Hito Sugerido
                            </h3>
                            <p className="text-xs font-bold opacity-80 mb-6 uppercase tracking-widest">Valoración 2 Años</p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <span className="material-symbols-outlined text-sm font-black">check_circle</span>
                                    Frases de 2 palabras
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <span className="material-symbols-outlined text-sm font-black">check_circle</span>
                                    Corre y sube escalones
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium opacity-50 italic">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    Sigue instrucciones simples
                                </li>
                            </ul>
                            <button className="w-full py-4 bg-white/20 backdrop-blur-md rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all border border-white/20">
                                Iniciar Evaluación
                            </button>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Modals */}
            {showRecordModal && patient && (
                <MedicalRecordForm
                    patientId={patient.id}
                    patientName={patient.user?.name || 'Paciente'}
                    onClose={() => setShowRecordModal(false)}
                    onSuccess={fetchDetails}
                    isExpress={true}
                />
            )}
        </div>
    );
}
