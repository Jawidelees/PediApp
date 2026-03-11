'use client';

import React, { useState, useEffect } from 'react';
import { getInventory, addInventoryStock } from '@/actions/inventory';
import {
    Plus, Search, Package, AlertTriangle, ArrowUp,
    Save, X, ShoppingCart, Activity, Loader2,
    History, Filter, ChevronRight, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import PediatricLogo from '@/components/ui/PediatricLogo';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function InventoryPage() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showStockModal, setShowStockModal] = useState<any>(null);
    const [stockAmount, setStockAmount] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    const loadInventory = async () => {
        setIsLoading(true);
        const data = await getInventory();
        setInventory(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const handleAddStock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showStockModal) return;
        setIsSaving(true);
        try {
            const res = await addInventoryStock(showStockModal.id, stockAmount);
            if (res.success) {
                setShowStockModal(null);
                setStockAmount(1);
                await loadInventory();
            } else {
                alert('Error al agregar stock');
            }
        } catch (err) {
            alert('Error crítico');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Inventario y Suministros</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Control de Insumos Médicos y Stock de Farmacia</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Historial
                    </button>
                    <button className="px-8 py-3 rounded-2xl bg-brand-500 text-white text-[11px] font-black uppercase tracking-widest shadow-glow hover:bg-brand-600 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo Artículo
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total de Artículos"
                    value={inventory.length.toString()}
                    icon={<Package className="text-brand-500" />}
                />
                <StatCard
                    label="Stock Bajo"
                    value={inventory.filter(i => i.stock <= i.minStock).length.toString()}
                    icon={<AlertTriangle className="text-amber-500" />}
                    color="text-amber-500"
                />
                <StatCard
                    label="Valor Estimado"
                    value={`Q${inventory.reduce((acc, i) => acc + (i.stock * Number(i.costPrice)), 0).toFixed(2)}`}
                    icon={<Activity className="text-emerald-500" />}
                />
            </div>

            {/* Search and List */}
            <div className="space-y-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, SKU o categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-[2rem] bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 shadow-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                    />
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <PediatricLogo spinning className="w-20 h-20 text-brand-500 drop-shadow-lg" />
                        <span className="text-xs font-black uppercase tracking-widest text-brand-400">Cargando Inventario...</span>
                    </div>
                ) : (
                    <div className="overflow-hidden bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-zinc-900">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Artículo</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Sellado</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidades Abiertas</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio Unitario</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-zinc-900">
                                {filteredInventory.map((item) => (
                                    <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{item.sku || 'SIN SKU'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "text-sm font-black",
                                                    item.stock <= item.minStock ? "text-red-500" : "text-gray-900 dark:text-white"
                                                )}>
                                                    {item.stock} pqts.
                                                </span>
                                                {item.stock <= item.minStock && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                {item.openPackageUnits} {item.baseUnitName}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-emerald-600">Q{Number(item.unitPrice).toFixed(2)}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => {
                                                    setShowStockModal(item);
                                                    setStockAmount(1);
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 text-[10px] font-black uppercase tracking-widest border border-brand-100 dark:border-brand-900/50 hover:bg-brand-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <ArrowUp className="w-3 h-3" />
                                                Ingresar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stock Modal */}
            {showStockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8 border-b border-gray-50 dark:border-zinc-900 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Ingreso de Stock</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{showStockModal.name}</p>
                            </div>
                            <button onClick={() => setShowStockModal(null)} className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleAddStock} className="p-8 space-y-6">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                <div className="flex gap-3">
                                    <ShoppingCart className="w-5 h-5 text-blue-500 shrink-0" />
                                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                                        Cada unidad de stock ingresada añadirá **{showStockModal.unitsPerPackage} {showStockModal.baseUnitName}** al inventario potencial.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paquetes / Unidades Selladas</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStockAmount(Math.max(1, stockAmount - 1))}
                                        className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-900 text-gray-600 flex items-center justify-center text-xl font-black"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={stockAmount}
                                        onChange={(e) => setStockAmount(parseInt(e.target.value))}
                                        className="flex-1 h-12 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50 text-center font-black text-lg outline-none focus:ring-2 focus:ring-brand-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setStockAmount(stockAmount + 1)}
                                        className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-900 text-gray-600 flex items-center justify-center text-xl font-black"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-4 rounded-2xl bg-brand-500 text-white text-[11px] font-black uppercase tracking-widest shadow-glow hover:bg-brand-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Confirmar Ingreso
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, icon, color = "text-gray-900 dark:text-white" }: { label: string, value: string, icon: React.ReactNode, color?: string }) {
    return (
        <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-lg shadow-inner">
                {icon}
            </div>
            <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{label}</p>
                <p className={cn("text-xl font-black uppercase tracking-tight", color)}>{value}</p>
            </div>
        </div>
    );
}
