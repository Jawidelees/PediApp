'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Activity,
    ChevronLeft,
    Save,
    X,
    Loader2,
    CheckCircle2,
    Clock,
    DollarSign
} from 'lucide-react';
import PediatricLogo from '@/components/ui/PediatricLogo';
import { useRouter } from 'next/navigation';
import { getServices, upsertService } from '@/actions/billing';
import { cn } from '@/lib/utils';

export default function ServicesPage() {
    const router = useRouter();
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);

    const fetchServices = async () => {
        setIsLoading(true);
        const data = await getServices();
        setServices(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await upsertService(editingService);
            if (res.success) {
                setEditingService(null);
                fetchServices();
            } else {
                alert('Error al guardar: ' + res.error);
            }
        } catch (err: any) {
            alert('Error de conexión');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fade-in max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-500 transition-colors mb-2"
                    >
                        <ChevronLeft className="w-3 h-3" />
                        Ajustes
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                        <Activity className="w-8 h-8 text-brand-500" />
                        Servicios Clínicos
                    </h1>
                </div>
                <button
                    onClick={() => setEditingService({ name: '', price: 0, duration: 30, description: '', active: true })}
                    className="px-6 py-3 rounded-2xl bg-brand-500 text-white text-[11px] font-black uppercase tracking-widest shadow-glow hover:bg-brand-600 transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Servicio
                </button>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-[2rem] bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 focus:border-brand-500 outline-none shadow-sm transition-all"
                    />
                </div>
                <div className="md:col-span-4 flex items-center justify-center p-4 rounded-[2rem] bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100/50 dark:border-brand-900/20">
                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                        Total: {services.length} Servicios configurados
                    </p>
                </div>
            </div>

            {/* Services Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
                    <PediatricLogo spinning className="w-16 h-16 text-brand-500 drop-shadow-lg" />
                    <span className="text-xs font-black uppercase tracking-widest text-brand-400">Cargando Servicios...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                        <div
                            key={service.id}
                            className={cn(
                                "group p-8 rounded-[3rem] border transition-all duration-300 relative overflow-hidden",
                                service.active
                                    ? "bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-800 hover:border-brand-300 shadow-sm"
                                    : "bg-gray-50/50 dark:bg-zinc-900/20 border-gray-100 dark:border-zinc-900 opacity-70"
                            )}
                        >
                            {!service.active && (
                                <div className="absolute top-4 right-8">
                                    <span className="text-[9px] font-black px-2 py-1 bg-gray-200 dark:bg-zinc-800 text-gray-500 rounded-full uppercase tracking-widest">Inactivo</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-brand-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">{service.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 min-h-[32px]">{service.description || 'Sin descripción'}</p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-zinc-900">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{service.duration} min</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-emerald-600 tracking-tighter">Q{Number(service.price).toFixed(2)}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setEditingService({ ...service, price: Number(service.price) })}
                                    className="w-full mt-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-900 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Editar Configuración
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredServices.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-gray-400 font-bold uppercase tracking-widest">No se encontraron servicios</p>
                        </div>
                    )}
                </div>
            )}

            {/* Edit/New Modal */}
            {editingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in no-print">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-xl rounded-[3rem] border border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col h-auto animate-scale-in">
                        <div className="p-8 border-b border-gray-50 dark:border-zinc-900 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                    {editingService.id ? 'Editar Servicio' : 'Nuevo Servicio'}
                                </h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Configuración técnica y de costos</p>
                            </div>
                            <button onClick={() => setEditingService(null)} className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-2xl hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Servicio</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingService.name}
                                        onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-brand-500 outline-none text-sm font-bold uppercase transition-all"
                                        placeholder="Ej. FISIOTERAPIA"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Costo Base (Q)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                value={editingService.price}
                                                onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) })}
                                                className="w-full pl-10 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-brand-500 outline-none text-sm font-bold transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duración (Minutos)</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="number"
                                                required
                                                value={editingService.duration}
                                                onChange={(e) => setEditingService({ ...editingService, duration: parseInt(e.target.value) })}
                                                className="w-full pl-10 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-brand-500 outline-none text-sm font-bold transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
                                    <textarea
                                        value={editingService.description || ''}
                                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                        rows={3}
                                        className="w-full p-6 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-brand-500 outline-none text-sm transition-all resize-none"
                                        placeholder="Breve detalle del servicio..."
                                    />
                                </div>

                                <div className="flex items-center gap-3 ml-1">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingService.active}
                                            onChange={(e) => setEditingService({ ...editingService, active: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                                    </label>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Servicio Activo / Visible</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-5 rounded-[2rem] bg-brand-500 text-white text-[11px] font-black uppercase tracking-widest shadow-glow hover:bg-brand-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {editingService.id ? 'Actualizar Servicio' : 'Guardar Nuevo Servicio'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
