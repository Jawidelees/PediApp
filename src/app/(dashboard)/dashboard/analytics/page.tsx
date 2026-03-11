'use client';

import React, { useState, useEffect } from 'react';
import {
    Activity,
    TrendingUp,
    Users,
    DollarSign,
    Heart,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Briefcase,
    Sparkles,
    ChevronRight,
    Search
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { getClinicalAnalytics } from '@/actions/analytics';

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const result = await getClinicalAnalytics();
                if (result) {
                    setData(result);
                } else {
                    throw new Error("No se recibieron datos del servidor");
                }
            } catch (err: any) {
                console.error("Error loading analytics:", err);
                setError(err.message || "Error al cargar los datos analíticos.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Activity className="w-10 h-10 text-brand-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center p-4">
                <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/10">
                    <Activity className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Error de Carga</h3>
                    <p className="text-sm text-gray-500">{error}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-brand-600 transition-all"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (!data) return null;

    const totalRevenue = data?.revenueByService ? (Object.values(data.revenueByService).reduce((a: any, b: any) => a + (Number(b) || 0), 0) as number) : 0;

    return (
        <div className="p-4 md:p-6 space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 text-[10px] font-black uppercase tracking-widest border border-brand-100">Inteligencia Clínica</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Business Intelligence</h1>
                    <p className="text-sm text-gray-500 font-medium">Panel de control estratégico para dueños y administradores de Clínica Pediátrica.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Últimos 7 Días
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Ingresos Totales"
                    value={formatCurrency(totalRevenue)}
                    trend="+12.4%"
                    icon={<DollarSign className="w-5 h-5" />}
                    positive
                />
                <StatCard
                    title="Citas Completadas"
                    value={data.productivityByDoctor.reduce((a: any, b: any) => a + (Number(b.count) || 0), 0)}
                    trend="+5.2%"
                    icon={<Users className="w-5 h-5" />}
                    positive
                />
                <StatCard
                    title="Tasa de Recuperación"
                    value={`${data.avgRecoveryRate}%`}
                    trend="+2.1%"
                    icon={<Heart className="w-5 h-5" />}
                    positive
                    special
                />
                <StatCard
                    title="Cobros Pendientes"
                    value={formatCurrency(Number(data.pendingRevenue._sum.totalAmount || 0))}
                    trend="-1.5%"
                    icon={<Activity className="w-5 h-5" />}
                    positive={false}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue by Service - Custom Chart UI */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 p-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-24 h-24 text-brand-500" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Rendimiento por Servicio</h3>

                    <div className="space-y-6 relative">
                        {Object.entries(data.revenueByService).map(([name, revenue]: any, i) => {
                            const percentage = (revenue / totalRevenue) * 100;
                            return (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full", i === 0 ? "bg-brand-500" : i === 1 ? "bg-indigo-500" : "bg-emerald-500")} />
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{name}</span>
                                        </div>
                                        <span className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(revenue)}</span>
                                    </div>
                                    <div className="h-4 w-full bg-gray-50 dark:bg-zinc-900 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000 delay-300",
                                                i === 0 ? "bg-brand-500" : i === 1 ? "bg-indigo-500" : "bg-emerald-500")}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Doctor Productivity */}
                <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 p-8 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6">Productividad Médica</h3>
                    <div className="space-y-5">
                        {data.productivityByDoctor.map((doc: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-50 dark:border-zinc-900 hover:border-brand-100 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center font-black text-xs">
                                        {doc.name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight truncate">{doc.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Atenciones Finalizadas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-brand-600 leading-none">{doc.count}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Pacientes</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 text-xs font-black uppercase tracking-widest hover:bg-brand-100 transition-all flex items-center justify-center gap-2">
                        Ver Reporte Detallado <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* AI Insights & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-black text-white shadow-2xl relative overflow-hidden border border-zinc-800">
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                        <Sparkles className="w-20 h-20 text-brand-400" />
                    </div>
                    <div className="relative space-y-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-brand-400" />
                            <h3 className="text-base font-black uppercase tracking-widest">Sugerencias de la IA para Dueños</h3>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                            Basado en los últimos datos: El servicio de <span className="text-brand-400 font-bold">Mecanoterapia</span> está operando al 85% de su capacidad. Se recomienda abrir un nuevo horario o adquirir un equipo adicional para capturar la demanda perdida.
                        </p>
                        <div className="pt-4 flex gap-4">
                            <div className="px-5 py-3 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Optimización</p>
                                <p className="text-sm font-bold text-brand-400">Personalizado</p>
                            </div>
                            <div className="px-5 py-3 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Alerta</p>
                                <p className="text-sm font-bold text-amber-400">Inventario Bajo</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 p-8 shadow-sm flex flex-col justify-center gap-4 text-center">
                    <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 mb-2 ring-8 ring-emerald-50/50">
                        <TrendingUp className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Eficiencia Clínica: Alta</h3>
                    <p className="text-xs text-zinc-400 font-medium px-10">La multiclínica mantiene un índice de satisfacción y rotación de pacientes óptimo este periodo.</p>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon, positive, special }: any) {
    return (
        <div className={cn(
            "p-6 rounded-[2rem] border transition-all hover:scale-[1.02] duration-300 group relative overflow-hidden",
            special ? "bg-brand-500 text-white border-brand-500 shadow-glowScale" : "bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-900 shadow-sm"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className={cn(
                    "p-3 rounded-2xl",
                    special ? "bg-white/20" : "bg-gray-50 dark:bg-zinc-900 text-brand-500"
                )}>
                    {icon}
                </div>
                <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase",
                    special ? "bg-white/20 text-white" : (positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")
                )}>
                    {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <div>
                <p className={cn("text-[10px] font-black uppercase tracking-widest", special ? "text-white/70" : "text-gray-400")}>{title}</p>
                <h3 className="text-2xl font-black mt-1 tracking-tighter">{value}</h3>
            </div>
        </div>
    );
}
