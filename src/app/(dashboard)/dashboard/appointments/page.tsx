'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
    getAllAppointments,
    updateAppointmentStatus,
    deleteAppointment
} from '@/actions/appointments';
import { toast } from 'sonner';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import CreateAppointmentModal from '@/components/dashboard/CreateAppointmentModal';
import LoadingIcon from '@/components/ui/LoadingIcon';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

export default function AppointmentsPage() {
    const { data: session } = useSession();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState('All');

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const data = await getAllAppointments();
            setAppointments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();

        const channel = new BroadcastChannel('notifications');
        channel.onmessage = (event) => {
            if (event.data.type === 'PUSH_RECEIVED') {
                fetchAppointments();
            }
        };

        return () => channel.close();
    }, []);

    const filteredAppointments = appointments.filter((apt) => {
        const matchesSearch = apt.patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.doctor.user.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDate = isSameDay(new Date(apt.date), selectedDate);

        const matchesTab = activeTab === 'All' ||
            (activeTab === 'Waiting' && apt.status === 'SCHEDULED') ||
            (activeTab === 'Consulting' && apt.status === 'CONFIRMED') ||
            (activeTab === 'Completed' && apt.status === 'COMPLETED');

        return matchesSearch && matchesDate && matchesTab;
    });

    const handleStatusUpdate = async (id: string, status: any) => {
        const res = await updateAppointmentStatus(id, status);
        if (res.success) {
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            toast.success('Estado actualizado');
        }
    };

    const nextDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoadingIcon />
            </div>
        );
    }

    const morningAppointments = filteredAppointments.filter(apt => new Date(apt.date).getHours() < 12);
    const afternoonAppointments = filteredAppointments.filter(apt => new Date(apt.date).getHours() >= 12);

    return (
        <div className="flex flex-col h-screen overflow-hidden animate-fade-in">
            {/* Header */}
            <header className="flex items-center bg-white dark:bg-background-dark/50 border-b border-slate-200 dark:border-slate-800 p-4 justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <span className="material-symbols-outlined">health_and_safety</span>
                    </div>
                    <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">Recepción</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold uppercase">
                        {session?.user?.name?.[0] || 'A'}
                    </div>
                </div>
            </header>

            {/* Search & Date Filter Area */}
            <div className="p-4 bg-white dark:bg-background-dark/30 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <label className="flex flex-1 h-12">
                        <div className="flex w-full items-stretch rounded-xl h-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-transparent focus-within:border-primary">
                            <div className="text-slate-500 flex items-center justify-center pl-4">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 text-base"
                                placeholder="Buscar paciente, ID o especialista..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </label>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        <span>Nueva Cita</span>
                    </button>
                </div>

                {/* Horizontal Date Picker */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {nextDays.map((date) => {
                        const isSelected = isSameDay(date, selectedDate);
                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => setSelectedDate(date)}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[60px] h-20 rounded-xl transition-all",
                                    isSelected
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                )}
                            >
                                <span className="text-xs font-medium uppercase">{format(date, 'eee', { locale: es })}</span>
                                <span className="text-lg font-bold">{format(date, 'd')}</span>
                            </button>
                        );
                    })}
                    <div className="ml-auto flex items-center px-4">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap capitalize">
                            {format(selectedDate, 'MMMM yyyy', { locale: es })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-background-dark/30 border-b border-slate-200 dark:border-slate-800">
                <div className="flex px-4 gap-6">
                    {['All', 'Waiting', 'Consulting', 'Completed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 font-bold text-sm tracking-wide transition-all",
                                activeTab === tab
                                    ? "border-primary text-primary"
                                    : "border-transparent text-slate-500"
                            )}
                        >
                            {tab === 'All' ? 'Todas' :
                                tab === 'Waiting' ? 'Espera' :
                                    tab === 'Consulting' ? 'Consulta' : 'Cerradas'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Appointment List */}
            <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-background-light dark:bg-background-dark pb-24">
                {/* Morning Sessions */}
                {morningAppointments.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sesiones de Mañana</h3>
                        {morningAppointments.map(apt => (
                            <AppointmentCard key={apt.id} apt={apt} onUpdate={handleStatusUpdate} />
                        ))}
                    </div>
                )}

                {/* Afternoon Sessions */}
                {afternoonAppointments.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sesiones de Tarde</h3>
                        {afternoonAppointments.map(apt => (
                            <AppointmentCard key={apt.id} apt={apt} onUpdate={handleStatusUpdate} />
                        ))}
                    </div>
                )}

                {filteredAppointments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-50">
                        <span className="material-symbols-outlined text-6xl mb-2">calendar_today</span>
                        <p className="font-bold">No hay citas para este día</p>
                    </div>
                )}
            </main>

            <CreateAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAppointments}
            />
        </div>
    );
}

function AppointmentCard({ apt, onUpdate }: { apt: any, onUpdate: (id: string, status: any) => void }) {
    const statusConfig: any = {
        SCHEDULED: { label: 'En Espera', color: 'border-amber-400', badge: 'bg-amber-400/10 text-amber-600', action: 'CHECK IN', nextStatus: 'CONFIRMED' },
        CONFIRMED: { label: 'En Consulta', color: 'border-primary', badge: 'bg-primary/10 text-primary', action: 'COMPLETAR', nextStatus: 'COMPLETED' },
        COMPLETED: { label: 'Completada', color: 'border-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600', action: null },
        CANCELLED: { label: 'Cancelada', color: 'border-rose-500', badge: 'bg-rose-500/10 text-rose-600', action: 'REAGENDAR' },
    };

    const config = statusConfig[apt.status];
    const time = format(new Date(apt.date), 'hh:mm');
    const period = format(new Date(apt.date), 'aa');

    return (
        <div className={cn(
            "bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border-l-4 flex items-center gap-4 transition-all hover:shadow-md",
            config.color,
            apt.status === 'COMPLETED' && "opacity-70"
        )}>
            <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-slate-100 dark:border-slate-800 pr-4">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{time}</span>
                <span className="text-[10px] text-slate-400 uppercase">{period}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">{apt.patient.user.name}</h4>
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight", config.badge)}>
                        {config.label}
                    </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{apt.service.name} • Dr. {apt.doctor.user.name.split(' ')[0]}</p>
            </div>
            {config.action && (
                <button
                    onClick={() => config.nextStatus && onUpdate(apt.id, config.nextStatus)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black py-2 px-3 rounded-lg transition-colors uppercase tracking-widest whitespace-nowrap"
                >
                    {config.action}
                </button>
            )}
            {apt.status === 'COMPLETED' && (
                <div className="text-emerald-500">
                    <span className="material-symbols-outlined">check_circle</span>
                </div>
            )}
        </div>
    );
}
