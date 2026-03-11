'use client';

import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Navigation, Calendar, Edit3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import PediatricLogo from '@/components/ui/PediatricLogo';

export function TreatmentPlanTab({ patientId, plans, onUpdate }: { patientId: string, plans: any[], onUpdate: () => void }) {
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [totalPhases, setTotalPhases] = useState(3);

    const handleCreatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/treatment/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId, title, description, totalPhases })
            });
            if (res.ok) {
                setIsCreating(false);
                onUpdate();
                setTitle('');
                setDescription('');
                setTotalPhases(3);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePhase = async (planId: string, currentPhase: number, totalPhases: number) => {
        if (currentPhase >= totalPhases) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/treatment/plan', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, currentPhase: currentPhase + 1 })
            });
            if (res.ok) onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Plan de Tratamiento</h3>
                    <p className="text-sm text-gray-500">Mide el progreso clínico del paciente por fases.</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-brand-50 text-brand-600 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-brand-100 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Plan
                    </button>
                )}
            </div>

            {isCreating && (
                <form onSubmit={handleCreatePlan} className="p-6 bg-white dark:bg-zinc-950 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 shadow-sm space-y-4">
                    <h4 className="font-bold mb-4">Estructurar Nuevo Plan</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Título del Tratamiento</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                placeholder="Ej: Tratamiento Ortodóntico Integral"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Número de Fases Totales</label>
                            <input
                                required
                                type="number" min="1" max="20"
                                value={totalPhases}
                                onChange={(e) => setTotalPhases(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Objetivo / Descripción Breve</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none h-24"
                            placeholder="Notas clínicas sobre el objetivo del plan..."
                        />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">
                            Cancelar
                        </button>
                        <button disabled={isSaving} type="submit" className="px-6 py-3 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-brand-600 transition-colors flex items-center gap-2">
                            {isSaving ? <PediatricLogo spinning className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            Crear Plan
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-6">
                {plans.map((plan: any) => {
                    const percentage = Math.round((plan.currentPhase / plan.totalPhases) * 100);
                    const isCompleted = plan.status === 'COMPLETED' || plan.currentPhase === plan.totalPhases;

                    return (
                        <div key={plan.id} className="p-6 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                            {isCompleted && (
                                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                    <CheckCircle2 className="w-48 h-48 text-emerald-500" />
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 mb-6">
                                <div>
                                    <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{plan.title}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{plan.description || 'Sin descripción detallada.'}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</p>
                                        <p className={cn("text-xs font-bold uppercase tracking-wider", isCompleted ? "text-emerald-500" : "text-brand-500")}>
                                            {isCompleted ? 'Finalizado' : 'En Curso'}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
                                        {isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Navigation className="w-6 h-6 text-brand-500" />}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Slider Display */}
                            <div className="relative z-10 space-y-3">
                                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest px-1">
                                    <span className={cn(isCompleted ? "text-emerald-500" : "text-brand-600")}>Progreso: {percentage}%</span>
                                    <span className="text-gray-400">Fase {plan.currentPhase} / {plan.totalPhases}</span>
                                </div>
                                <div className="h-4 w-full bg-gray-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000 ease-out", isCompleted ? "bg-emerald-500" : "bg-brand-500")}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>

                            {!isCompleted && (
                                <div className="mt-8 flex justify-end relative z-10 border-t border-gray-50 dark:border-zinc-900 pt-6">
                                    <button
                                        onClick={() => handleUpdatePhase(plan.id, plan.currentPhase, plan.totalPhases)}
                                        disabled={isSaving}
                                        className="px-6 py-3 bg-brand-50 text-brand-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-100 transition-colors flex items-center gap-2"
                                    >
                                        {isSaving ? <PediatricLogo spinning className="w-4 h-4" /> : <ArrowRightCircleIcon />}
                                        Avanzar a Fase {plan.currentPhase + 1}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {plans.length === 0 && !isCreating && (
                    <div className="text-center py-20 bg-gray-50/50 dark:bg-zinc-900/10 rounded-[3rem] border border-gray-100 dark:border-zinc-800">
                        <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Ningún plan clínico activo</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ArrowRightCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    );
}
