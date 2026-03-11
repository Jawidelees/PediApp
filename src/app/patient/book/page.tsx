/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveServices, getAvailableDoctors, createPatientAppointment } from '@/actions/appointments';
import { Calendar, Clock, User, Activity, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import PediatricLogo from '@/components/ui/PediatricLogo';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

export default function BookAppointmentPage() {
    const router = useRouter();
    const [services, setServices] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    // Selection State
    // ... rest of state ...
    const [selectedService, setSelectedService] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [step, setStep] = useState(1); // 1: Service, 2: Doctor, 3: DateTime, 4: Confirm

    useEffect(() => {
        const fetchData = async () => {
            const [s, d] = await Promise.all([getActiveServices(), getAvailableDoctors()]);
            setServices(s);
            setDoctors(d);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    // Fetch occupied slots when doctor or date changes
    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            const fetchSlots = async () => {
                setIsLoadingSlots(true);
                const { getOccupiedSlots } = await import('@/actions/appointments');
                const slots = await getOccupiedSlots(selectedDoctor, selectedDate);
                setOccupiedSlots(slots);
                setIsLoadingSlots(false);
                // If selected time is now occupied, reset it
                if (slots.includes(selectedTime)) setSelectedTime('');
            };
            fetchSlots();
        }
    }, [selectedDoctor, selectedDate]);

    const handleBooking = async () => {
        setIsSubmitting(true);
        const dateStr = `${selectedDate}T${selectedTime}:00`;
        const res = await createPatientAppointment({
            serviceId: selectedService,
            doctorId: selectedDoctor,
            date: dateStr,
            notes
        });

        if (res.success) {
            router.push('/patient/history');
            router.refresh();
        } else {
            alert(res.error || 'Error al programar la cita. Por favor intenta de nuevo.');
            setIsSubmitting(false);
            // Refresh slots if it failed due to collision
            if (res.error?.includes('ocupado')) {
                const { getOccupiedSlots } = await import('@/actions/appointments');
                const slots = await getOccupiedSlots(selectedDoctor, selectedDate);
                setOccupiedSlots(slots);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
                <PediatricLogo spinning className="w-16 h-16 text-brand-500 drop-shadow-lg" />
                <span className="text-xs font-black uppercase tracking-widest text-brand-400">Cargando Disponibilidad...</span>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Cita</h1>
                <p className="text-sm text-gray-500 mt-1">Sigue los pasos para programar tu visita.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                            step >= s ? "bg-brand-500 text-white" : "bg-gray-200 dark:bg-zinc-800 text-gray-500"
                        )}>
                            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                        </div>
                        {s < 3 && (
                            <div className={cn(
                                "w-12 h-0.5 mx-2",
                                step > s ? "bg-brand-500" : "bg-gray-200 dark:bg-zinc-800"
                            )} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Service */}
            {step === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-brand-500" />
                        ¿Qué servicio necesitas?
                    </h2>
                    <div className="grid gap-3">
                        {services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => { setSelectedService(service.id); setStep(2); }}
                                className={cn(
                                    "p-4 rounded-2xl border text-left transition-all hover:border-brand-300 group",
                                    selectedService === service.id ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-800"
                                )}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600">{service.name}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Doctor */}
            {step === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-brand-500" />
                            Selecciona un especialista
                        </h2>
                        <button onClick={() => setStep(1)} className="text-xs text-gray-400 hover:text-brand-500 underline">Atrás</button>
                    </div>
                    <div className="grid gap-3">
                        {doctors.map((doc) => (
                            <button
                                key={doc.id}
                                onClick={() => { setSelectedDoctor(doc.id); setStep(3); }}
                                className={cn(
                                    "p-4 rounded-2xl border text-left transition-all hover:border-brand-300 group flex items-center gap-4",
                                    selectedDoctor === doc.id ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-800"
                                )}
                            >
                                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0">
                                    <User className="w-6 h-6 text-brand-600" />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white block">{doc.user.name}</span>
                                    <span className="text-xs text-brand-600 font-medium">{doc.specialty}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-brand-500" />
                            Fecha y Hora
                        </h2>
                        <button onClick={() => setStep(2)} className="text-xs text-gray-400 hover:text-brand-500 underline">Atrás</button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Día de la cita</label>
                            <input
                                type="date"
                                value={selectedDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Hora sugerida</label>
                            {isLoadingSlots ? (
                                <div className="flex items-center gap-2 py-4">
                                    <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                                    <span className="text-xs text-brand-400 font-bold uppercase tracking-widest">Verificando agenda...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((t) => {
                                        const isOccupied = occupiedSlots.includes(t);
                                        return (
                                            <button
                                                key={t}
                                                disabled={isOccupied}
                                                onClick={() => setSelectedTime(t)}
                                                className={cn(
                                                    "py-3 rounded-xl border text-sm font-bold transition-all",
                                                    selectedTime === t
                                                        ? "bg-brand-500 border-brand-500 text-white shadow-glowScale"
                                                        : isOccupied
                                                            ? "bg-gray-50 dark:bg-zinc-900 border-transparent text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50"
                                                            : "bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-800 text-gray-600 hover:border-brand-300"
                                                )}
                                            >
                                                {t}
                                                {isOccupied && <span className="block text-[8px] opacity-60">Ocupado</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Notas adicionales (opcional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Comparte algún detalle con el doctor..."
                                className="w-full p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500/20 resize-none"
                            />
                        </div>
                    </div>

                    <button
                        disabled={!selectedDate || !selectedTime || isSubmitting}
                        onClick={handleBooking}
                        className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all flex items-center justify-center gap-2 hover:shadow-glow disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Agendar Cita
                    </button>
                </div>
            )}
        </div>
    );
}
