'use client';

import React, { useState, useMemo } from 'react';
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay, getHours, getMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, User, CheckCircle2, XCircle, Activity, Calendar as CalendarIcon, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
    appointments: any[];
    onStatusUpdate: (id: string, status: string) => void;
    onEdit?: (appointment: any) => void;
    onDelete?: (id: string) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM (22:00)

export default function CalendarView({ appointments, onStatusUpdate, onEdit, onDelete }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

    const handlePrevious = () => {
        if (viewMode === 'day') setCurrentDate(prev => subDays(prev, 1));
        else setCurrentDate(prev => subWeeks(prev, 1));
    };

    const handleNext = () => {
        if (viewMode === 'day') setCurrentDate(prev => addDays(prev, 1));
        else setCurrentDate(prev => addWeeks(prev, 1));
    };

    const handleToday = () => setCurrentDate(new Date());

    // Generate days for the current view
    const daysToRender = useMemo(() => {
        if (viewMode === 'day') return [currentDate];
        const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
        return Array.from({ length: 7 }, (_, i) => addDays(start, i)); // Sun-Sat
    }, [currentDate, viewMode]);

    // Position an appointment vertically based on time
    const getEventStyle = (dateStr: string, durationMinutes: number = 60) => {
        const date = new Date(dateStr);
        const hours = getHours(date);
        const minutes = getMinutes(date);

        // Calculate offset from 8 AM
        const hourOffset = hours - 8;
        if (hourOffset < 0 || hourOffset >= 15) return { display: 'none' }; // Out of bounds

        const topPx = (hourOffset * 80) + (minutes / 60) * 80;
        const heightPx = (durationMinutes / 60) * 80;

        return {
            top: `${topPx}px`,
            height: `${heightPx}px`,
        };
    };

    const getStatusColors = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-emerald-100/90 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 shadow-emerald-500/10';
            case 'COMPLETED': return 'bg-brand-100/90 dark:bg-brand-900/40 border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-300 shadow-brand-500/10';
            case 'CANCELLED': return 'bg-red-100/90 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 shadow-red-500/10';
            case 'SCHEDULED': return 'bg-amber-100/90 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 shadow-amber-500/10 ring-2 ring-amber-500/20';
            default: return 'bg-indigo-100/90 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 shadow-indigo-500/10';
        }
    };

    return (
        <div className="flex flex-col h-[80vh] min-h-[600px] bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden animate-fade-in relative z-10">
            {/* Header Toolbar */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-50 dark:border-zinc-900 bg-gray-50/50 dark:bg-zinc-900/20 backdrop-blur-xl z-20 relative">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white dark:bg-zinc-900 rounded-2xl p-1 shadow-sm border border-gray-100 dark:border-zinc-800">
                        <button onClick={handlePrevious} className="p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors text-gray-500">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={handleToday} className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-colors">
                            Hoy
                        </button>
                        <button onClick={handleNext} className="p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors text-gray-500">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white capitalize tracking-tighter">
                        {viewMode === 'day'
                            ? format(currentDate, "EEEE, d 'de' MMMM", { locale: es })
                            : format(currentDate, "MMMM yyyy", { locale: es })
                        }
                    </h2>
                </div>

                <div className="flex p-1 bg-gray-100 dark:bg-zinc-900 rounded-2xl border border-gray-200/50 dark:border-zinc-800/50">
                    <button
                        onClick={() => setViewMode('day')}
                        className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", viewMode === 'day' ? "bg-white dark:bg-zinc-950 text-brand-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}
                    >
                        Día
                    </button>
                    <button
                        onClick={() => setViewMode('week')}
                        className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", viewMode === 'week' ? "bg-white dark:bg-zinc-950 text-brand-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}
                    >
                        Semana
                    </button>
                </div>
            </div>

            {/* Calendar Grid wrapper */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-white dark:bg-zinc-950">
                {/* Horizontal time lines background */}
                <div className="absolute inset-0 z-0 flex flex-col pt-12">
                    {HOURS.map(hour => (
                        <div key={hour} className="h-[80px] flex-shrink-0 border-t border-gray-100 dark:border-zinc-800/60 w-full relative">
                            <span className="absolute -top-3 left-4 text-[10px] font-black text-gray-300 dark:text-zinc-700 uppercase tracking-widest z-20 bg-white dark:bg-zinc-950 px-2 rounded-md">
                                {hour}:00
                            </span>
                        </div>
                    ))}
                </div>

                <div className="relative z-10 flex min-w-[800px] h-[1248px] pl-20 pr-4 pt-12">
                    {daysToRender.map((day, colIdx) => {
                        const dayAppointments = appointments.filter(apt => isSameDay(new Date(apt.date), day));

                        return (
                            <div key={colIdx} className="flex-1 relative border-l border-dashed border-gray-100 dark:border-zinc-800/50 min-w-[150px]">
                                {/* Day Header (only in week view) */}
                                {viewMode === 'week' && (
                                    <div className="absolute -top-10 left-0 w-full text-center">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">{format(day, 'EEE', { locale: es })}</p>
                                        <p className={cn("text-lg font-black mt-0.5", isSameDay(day, new Date()) ? "text-brand-600" : "text-gray-900 dark:text-gray-300")}>{format(day, 'd')}</p>
                                    </div>
                                )}

                                {/* Events container */}
                                <div className="absolute inset-0 w-full px-2">
                                    {dayAppointments.map(apt => (
                                        <div
                                            key={apt.id}
                                            className={cn(
                                                "absolute left-2 right-2 rounded-2xl border p-3 flex flex-col justify-between overflow-hidden shadow-lg backdrop-blur-md transition-transform hover:scale-[1.02] hover:z-30 cursor-pointer group",
                                                getStatusColors(apt.status)
                                            )}
                                            style={getEventStyle(apt.date, apt.service?.duration || 60)}
                                            title={`${apt.patient.user.name} - ${apt.service.name}`}
                                        >
                                            <div className="space-y-1 relative z-10">
                                                <div className="flex items-start justify-between">
                                                    <p className="text-xs font-black truncate max-w-[80%]">{apt.patient.user.name}</p>
                                                    <span className="text-[9px] font-black opacity-60 bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded uppercase tracking-widest leading-none">
                                                        {format(new Date(apt.date), 'h:mm a')}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-bold opacity-75 truncate flex items-center gap-1">
                                                    <Activity className="w-3 h-3" />
                                                    {apt.service.name}
                                                </p>
                                                {viewMode === 'day' && (
                                                    <p className="text-[10px] font-bold opacity-75 truncate flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        Dr. {apt.doctor.user.name}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Hover Actions */}
                                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl p-1 flex gap-1 shadow-sm">
                                                {apt.status === 'SCHEDULED' && (
                                                    <>
                                                        <button onClick={(e) => { e.stopPropagation(); onStatusUpdate(apt.id, 'CONFIRMED'); }} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50" title="Confirmar">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); onStatusUpdate(apt.id, 'CANCELLED'); }} className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50" title="Cancelar">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); onEdit?.(apt); }} className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/50" title="Editar">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete?.(apt.id); }} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50" title="Eliminar">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
