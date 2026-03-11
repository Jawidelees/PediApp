'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPatientDetails } from '@/actions/patient';
import { saveDigitalPrescription } from '@/actions/prescriptions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import LoadingIcon from '@/components/ui/LoadingIcon';

interface Medication {
    id: string;
    name: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string;
}

export default function PrescriptionPage() {
    const params = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [medications, setMedications] = useState<Medication[]>([
        { id: '1', name: '', dose: '', frequency: '', duration: '', instructions: '' }
    ]);

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

    const addMedication = () => {
        setMedications([...medications, { id: Math.random().toString(), name: '', dose: '', frequency: '', duration: '', instructions: '' }]);
    };

    const removeMedication = (id: string) => {
        if (medications.length > 1) {
            setMedications(medications.filter(m => m.id !== id));
        }
    };

    const updateMedication = (id: string, field: keyof Medication, value: string) => {
        setMedications(medications.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleSave = async (shareVia?: 'whatsapp' | 'email') => {
        if (!diagnosis) return toast.error('Ingrese el diagnóstico');
        if (medications.some(m => !m.name || !m.dose)) return toast.error('Complete los datos del medicamento');

        setIsSaving(true);
        try {
            const res = await saveDigitalPrescription({
                patientId: patient.id,
                diagnosis,
                medications: medications.map(({ id, ...m }) => m)
            });

            if (res.success) {
                toast.success('Receta generada con éxito');
                if (shareVia === 'whatsapp') {
                    const message = `💊 *Receta Médica - Clínica Pediátrica*\n\nHola, adjunto la receta para *${patient.user.name}*.\n\n*Diagnóstico:* ${diagnosis}\n\n${medications.map(m => `• *${m.name}*: ${m.dose} cada ${m.frequency} por ${m.duration}.`).join('\n')}\n\n*Instrucciones:* ${medications[0].instructions || 'Seguir indicaciones indicadas.'}`;
                    window.open(`https://wa.me/${patient.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                }
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
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 ml-2 text-center mr-10 uppercase tracking-[0.1em]">Receta Digital</h2>
            </header>

            <main className="flex-1 p-6 space-y-8 max-w-2xl mx-auto w-full">
                {/* Diagnosis Section */}
                <section className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                        <span className="material-symbols-outlined text-lg">psychiatry</span>
                        Diagnóstico / Motivo
                    </h4>
                    <input
                        className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none px-6 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary placeholder:text-slate-400"
                        placeholder="Ej: Faringoamigdalitis pultacia"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                    />
                </section>

                {/* Medications List (Stitch Dynamic UX) */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between pl-2 mr-2">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-primary">pill</span>
                            Medicamentos
                        </h4>
                        <button onClick={addMedication} className="size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-all">
                            <span className="material-symbols-outlined text-xl">add</span>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {medications.map((med, index) => (
                            <div key={med.id} className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group">
                                {medications.length > 1 && (
                                    <button
                                        onClick={() => removeMedication(med.id)}
                                        className="absolute -top-2 -right-2 size-8 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                )}

                                <div className="space-y-4">
                                    <input
                                        className="w-full h-12 bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-primary focus:ring-0 px-0 font-black text-lg text-slate-900 dark:text-white placeholder:text-slate-300"
                                        placeholder="Nombre del medicamento"
                                        value={med.name}
                                        onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                                    />

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Dosis</p>
                                            <input
                                                className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none px-3 text-xs font-bold text-slate-700 dark:text-slate-300"
                                                placeholder="5ml / 1 tableta"
                                                value={med.dose}
                                                onChange={(e) => updateMedication(med.id, 'dose', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Frecuencia</p>
                                            <input
                                                className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none px-3 text-xs font-bold text-slate-700 dark:text-slate-300"
                                                placeholder="Cada 8 hrs"
                                                value={med.frequency}
                                                onChange={(e) => updateMedication(med.id, 'frequency', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Duración</p>
                                            <input
                                                className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none px-3 text-xs font-bold text-slate-700 dark:text-slate-300"
                                                placeholder="7 días"
                                                value={med.duration}
                                                onChange={(e) => updateMedication(med.id, 'duration', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <input
                                        className="w-full h-10 bg-slate-100/50 dark:bg-slate-800/30 rounded-xl px-4 text-[10px] font-medium italic text-slate-500 border-none"
                                        placeholder="Indicaciones adicionales para los padres..."
                                        value={med.instructions}
                                        onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => handleSave('whatsapp')}
                        disabled={isSaving}
                        className="py-5 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined">send</span>
                        WhatsApp a Padres
                    </button>
                    <button
                        onClick={() => handleSave()}
                        disabled={isSaving}
                        className="py-5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">description</span>
                        Generar Receta PDF
                    </button>
                </div>

                <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-50">
                    SISTEMA DE RECETADO DIGITAL AUTOMATIZADO V2.0
                </p>
            </main>
        </div>
    );
}
