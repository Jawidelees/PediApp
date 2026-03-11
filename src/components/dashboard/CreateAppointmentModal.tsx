'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Activity, Clock, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPatients } from '@/actions/patient';
import { getActiveServices, getAvailableDoctors, createStaffAppointment, updateAppointment } from '@/actions/appointments';
import { toast } from 'sonner';

interface CreateAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    appointment?: any; // Add this for Edit Mode
}

export default function CreateAppointmentModal({ isOpen, onClose, onSuccess, appointment }: CreateAppointmentModalProps) {
    const [patients, setPatients] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        patientId: '',
        serviceId: '',
        doctorId: '',
        date: '',
        time: '',
        notes: '',
    });

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [p, s, d] = await Promise.all([
                        getPatients(),
                        getActiveServices(),
                        getAvailableDoctors(),
                    ]);
                    setPatients(p);
                    setServices(s);
                    setDoctors(d);

                    // Pre-rellenar si estamos editando
                    if (appointment) {
                        const dateObj = new Date(appointment.date);
                        setFormData({
                            patientId: appointment.patientId,
                            serviceId: appointment.serviceId,
                            doctorId: appointment.doctorId,
                            date: dateObj.toISOString().split('T')[0],
                            time: dateObj.toTimeString().split(' ')[0].substring(0, 5),
                            notes: appointment.medicalRecord?.notes?.split(']: ')[1] || appointment.notes || '',
                        });
                    } else {
                        // Reset form if creating new
                        setFormData({
                            patientId: '',
                            serviceId: '',
                            doctorId: '',
                            date: '',
                            time: '',
                            notes: '',
                        });
                    }
                } catch (error) {
                    console.error(error);
                    toast.error('Error al cargar datos del formulario');
                } finally {
                    setIsLoading(true); // Temporarily keep true to avoid flicker before data is set
                    setTimeout(() => setIsLoading(false), 50);
                }
            };
            fetchData();
        }
    }, [isOpen, appointment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.patientId || !formData.serviceId || !formData.doctorId || !formData.date || !formData.time) {
            toast.error('Por favor complete todos los campos obligatorios');
            return;
        }

        setIsSubmitting(true);
        try {
            // Combinar fecha y hora con el offset fijo de Guatemala (UTC-6)
            const appointmentDate = new Date(`${formData.date}T${formData.time}:00-06:00`);

            const res = appointment
                ? await updateAppointment(appointment.id, {
                    patientId: formData.patientId,
                    serviceId: formData.serviceId,
                    doctorId: formData.doctorId,
                    date: appointmentDate,
                    notes: formData.notes,
                } as any)
                : await createStaffAppointment({
                    patientId: formData.patientId,
                    serviceId: formData.serviceId,
                    doctorId: formData.doctorId,
                    date: appointmentDate,
                    notes: formData.notes,
                });

            if (res.success) {
                toast.success(appointment ? 'Cita actualizada correctamente' : 'Cita programada correctamente');
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || 'Error al procesar la cita');
            }
        } catch (error) {
            toast.error('Ocurrió un error inesperado');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {appointment ? 'Editar Cita' : 'Nueva Cita'}
                            </h2>
                            <p className="text-xs text-brand-600 font-medium">Clínica Pediátrica — Panel de Recepción</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                        <p className="text-sm text-gray-500 animate-pulse">Cargando catálogo...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Paciente */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-brand-500 ml-1">Paciente</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    required
                                    value={formData.patientId}
                                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all appearance-none"
                                >
                                    <option value="">Seleccionar paciente...</option>
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>{p.user.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Servicio */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-brand-500 ml-1">Servicio</label>
                                <div className="relative">
                                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select
                                        required
                                        value={formData.serviceId}
                                        onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Seleccionar servicio...</option>
                                        {services.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Doctor */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-brand-500 ml-1">Doctor Especialista</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select
                                        required
                                        value={formData.doctorId}
                                        onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Seleccionar doctor...</option>
                                        {doctors.map((d) => (
                                            <option key={d.id} value={d.id}>{d.user.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Fecha */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-brand-500 ml-1">Fecha</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Hora */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-brand-500 ml-1">Hora</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="time"
                                        required
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notas */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-brand-500 ml-1">Notas / Motivo de Consulta</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
                                    placeholder="Detalles adicionales opcionales..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {appointment ? 'Actualizando...' : 'Programando...'}
                                    </>
                                ) : (
                                    appointment ? 'Actualizar Cita' : 'Agendar Cita'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
