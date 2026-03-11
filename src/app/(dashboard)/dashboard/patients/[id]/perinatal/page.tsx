'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPatientDetails } from '@/actions/patient';
import { updatePerinatalHistory } from '@/actions/pediatric-records';
import { cn, calculateAge } from '@/lib/utils';
import { toast } from 'sonner';
import LoadingIcon from '@/components/ui/LoadingIcon';

export default function PerinatalPage() {
    const params = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        gestationalWeeks: 0,
        birthWeight: 0,
        birthHeight: 0,
        apgar1: 9,
        apgar5: 10,
        notes: '',
    });

    const fetchDetails = useCallback(async () => {
        if (params.id) {
            setIsLoading(true);
            try {
                const data = await getPatientDetails(params.id as string);
                setPatient(data);
                if (data) {
                    const apgarParts = (data.apgarScore || '').split('/');
                    setFormData({
                        gestationalWeeks: data.gestationalWeeks || 38,
                        birthWeight: Number(data.birthWeight) || 3.2,
                        birthHeight: Number(data.birthHeight) || 50,
                        apgar1: parseInt(apgarParts[0] || '9') || 9,
                        apgar5: parseInt(apgarParts[1] || '10') || 10,
                        notes: data.perinatalNotes || '',
                    });
                }
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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await updatePerinatalHistory({
                patientId: patient.id,
                gestationalWeeks: formData.gestationalWeeks,
                birthWeight: formData.birthWeight,
                birthHeight: formData.birthHeight,
                apgarScore: `${formData.apgar1}/${formData.apgar5}`,
                perinatalNotes: formData.notes,
            });

            if (res.success) {
                toast.success('Registro perinatal actualizado');
                router.back();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-[60vh]"><LoadingIcon /></div>;
    if (!patient) return null;

    return (
        <div className="flex flex-col bg-white dark:bg-background-dark min-h-screen animate-fade-in pb-24 text-slate-900 dark:text-slate-100">
            <header className="flex items-center bg-white dark:bg-background-dark p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 w-full">
                <button onClick={() => router.back()} className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 ml-2 text-center mr-10 uppercase tracking-[0.1em]">Registro Perinatal</h2>
            </header>

            <main className="flex-1 p-6 space-y-8 max-w-xl mx-auto w-full">
                {/* Visual Bio Header */}
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800/60 flex items-center gap-4">
                    <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black">
                        {patient.user.name[0]}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Paciente</p>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{patient.user.name}</h3>
                    </div>
                </div>

                {/* Birth Logistics */}
                <section className="space-y-6">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">event_note</span>
                        Datos del Nacimiento
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Semanas Gestación</label>
                            <input
                                type="number"
                                className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none px-6 font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-primary transition-all"
                                value={formData.gestationalWeeks}
                                onChange={(e) => setFormData({ ...formData, gestationalWeeks: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Tipo de Parto</label>
                            <div className="h-14 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center px-6 font-bold text-slate-900 dark:text-white text-sm">
                                Eutócico (Normal)
                            </div>
                        </div>
                    </div>
                </section>

                {/* Anthropometry (Real Input Cards) */}
                <section className="space-y-6">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">straighten</span>
                        Antropometría Neonatal
                    </h4>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-3xl text-primary">weight</span>
                                <div>
                                    <p className="text-xs font-black uppercase text-slate-900 dark:text-white">Peso al Nacer</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gramos / Kilogramos</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-24 h-12 bg-slate-50 dark:bg-slate-800 text-center rounded-xl font-black text-primary focus:ring-2 focus:ring-primary border-none"
                                    value={formData.birthWeight}
                                    onChange={(e) => setFormData({ ...formData, birthWeight: parseFloat(e.target.value) })}
                                />
                                <span className="text-xs font-black text-slate-400 uppercase">KG</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-3xl text-primary">height</span>
                                <div>
                                    <p className="text-xs font-black uppercase text-slate-900 dark:text-white">Talla al Nacer</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Centímetros</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    step="0.5"
                                    className="w-24 h-12 bg-slate-50 dark:bg-slate-800 text-center rounded-xl font-black text-primary focus:ring-2 focus:ring-primary border-none"
                                    value={formData.birthHeight}
                                    onChange={(e) => setFormData({ ...formData, birthHeight: parseFloat(e.target.value) })}
                                />
                                <span className="text-xs font-black text-slate-400 uppercase">CM</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* APGAR Scoring (Interactive ASIP Design) */}
                <section className="space-y-6">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">medical_information</span>
                        Puntuación APGAR
                    </h4>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 text-center group">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">A 1 Minuto</p>
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() => setFormData({ ...formData, apgar1: Math.max(0, formData.apgar1 - 1) })}
                                    className="size-10 rounded-xl bg-white dark:bg-slate-800 text-primary flex items-center justify-center shadow-sm"
                                >
                                    <span className="material-symbols-outlined font-black">remove</span>
                                </button>
                                <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{formData.apgar1}</span>
                                <button
                                    onClick={() => setFormData({ ...formData, apgar1: Math.min(10, formData.apgar1 + 1) })}
                                    className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"
                                >
                                    <span className="material-symbols-outlined font-black">add</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-[2rem] p-6 text-center group">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">A 5 Minutos</p>
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() => setFormData({ ...formData, apgar5: Math.max(0, formData.apgar5 - 1) })}
                                    className="size-10 rounded-xl bg-white dark:bg-slate-800 text-emerald-600 flex items-center justify-center shadow-sm"
                                >
                                    <span className="material-symbols-outlined font-black">remove</span>
                                </button>
                                <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{formData.apgar5}</span>
                                <button
                                    onClick={() => setFormData({ ...formData, apgar5: Math.min(10, formData.apgar5 + 1) })}
                                    className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20"
                                >
                                    <span className="material-symbols-outlined font-black">add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notes & Submission */}
                <section className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Observaciones Perinatales</label>
                    <textarea
                        className="w-full h-32 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border-none p-6 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary"
                        placeholder="Tamizajes, complicaciones, llanto espontáneo..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </section>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.5rem] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                >
                    {isSaving ? <LoadingIcon className="size-5" /> : (
                        <>
                            <span className="material-symbols-outlined">save</span>
                            Guardar Registro
                        </>
                    )}
                </button>
            </main>
        </div>
    );
}
