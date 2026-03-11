'use client';

import React, { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    Search,
    AlertTriangle,
    TrendingDown,
    Activity,
    MoreVertical,
    Pencil,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInventory, deleteInventoryItem } from '@/actions/inventory';
import InventoryForm from '@/components/inventory/InventoryForm';
import { useRouter } from 'next/navigation';

type InventoryItem = {
    id: string;
    name: string;
    sku: string | null;
    stock: number;
    openPackageUnits: number;
    unitsPerPackage: number;
    unitName: string;
    baseUnitName: string;
    minStock: number;
    unitPrice: any;
    costPrice: any;
    description?: string;
};

function getStockStatus(stock: number, minStock: number) {
    if (stock <= minStock * 0.3) return { label: 'CRÍTICO', class: 'badge-danger' };
    if (stock <= minStock) return { label: 'BAJO', class: 'badge-warning' };
    return { label: 'OK', class: 'badge-success' };
}

export default function InventoryPage() {
    const router = useRouter();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'low' | 'critical'>('all');
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const loadInventory = async () => {
        setIsLoading(true);
        const data = await getInventory();
        setInventory(data as any);
        setIsLoading(false);
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const handleCreate = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('¿Estás seguro de eliminar este artículo?')) return;

        const result = await deleteInventoryItem(id);
        if (result.success) {
            router.refresh();
            loadInventory();
        } else {
            alert(result.error);
        }
    };

    const filteredInventory = inventory
        .filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.sku?.toLowerCase().includes(searchQuery.toLowerCase());

            if (filter === 'low') return matchesSearch && item.stock <= item.minStock;
            if (filter === 'critical') return matchesSearch && item.stock <= item.minStock * 0.3;
            return matchesSearch;
        });

    const lowStockCount = inventory.filter(i => i.stock <= i.minStock).length;
    const criticalCount = inventory.filter(i => i.stock <= i.minStock * 0.3).length;

    if (isLoading && inventory.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <Activity className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventario</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {inventory.length} artículos · {lowStockCount} bajo stock · {criticalCount} crítico
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm transition-all hover:shadow-glow"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Artículo
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-3 grid-cols-3">
                <button
                    onClick={() => setFilter('all')}
                    className={cn(
                        'p-4 rounded-xl border transition-all text-left',
                        filter === 'all'
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                            : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-gray-300'
                    )}
                >
                    <Package className="w-5 h-5 text-brand-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{inventory.length}</p>
                    <p className="text-xs text-gray-500">Total Artículos</p>
                </button>
                <button
                    onClick={() => setFilter('low')}
                    className={cn(
                        'p-4 rounded-xl border transition-all text-left',
                        filter === 'low'
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-gray-300'
                    )}
                >
                    <TrendingDown className="w-5 h-5 text-amber-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{lowStockCount}</p>
                    <p className="text-xs text-gray-500">Stock Bajo</p>
                </button>
                <button
                    onClick={() => setFilter('critical')}
                    className={cn(
                        'p-4 rounded-xl border transition-all text-left',
                        filter === 'critical'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-gray-300'
                    )}
                >
                    <AlertTriangle className="w-5 h-5 text-red-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{criticalCount}</p>
                    <p className="text-xs text-gray-500">Crítico</p>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                />
            </div>

            {/* Inventory Table */}
            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
                                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Artículo</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">SKU</th>
                                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Stock Real</th>
                                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Mínimo</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">Precio Dosis</th>
                                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map((item) => {
                                const status = getStockStatus(item.stock, item.minStock);
                                const stockPercent = Math.min((item.stock / item.minStock) * 100, 100);

                                // Fractioning logic for UI
                                const hasFractioning = item.unitsPerPackage > 1;
                                const openPercent = hasFractioning ? (item.openPackageUnits / item.unitsPerPackage) * 100 : 0;

                                return (
                                    <tr
                                        key={item.id}
                                        className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer"
                                        onClick={() => handleEdit(item)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                                                {hasFractioning && (
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter">
                                                        {item.unitsPerPackage} {item.baseUnitName}s por {item.unitName}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className="text-xs font-mono text-gray-400">{item.sku || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex flex-col items-center gap-1 min-w-[120px]">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="font-bold text-gray-900 dark:text-white">{item.stock}</span>
                                                    <span className="text-[10px] text-gray-500">{item.unitName}{item.stock !== 1 ? 's' : ''}</span>
                                                    {hasFractioning && item.openPackageUnits > 0 && (
                                                        <span className="text-xs text-brand-600 dark:text-brand-400 font-medium ml-1">
                                                            + {item.openPackageUnits} {item.baseUnitName}{item.openPackageUnits !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Global Stock Bar */}
                                                <div className="w-full max-w-[100px] h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden relative">
                                                    <div
                                                        className={cn(
                                                            'h-full rounded-full transition-all',
                                                            status.label === 'OK' ? 'bg-emerald-500' :
                                                                status.label === 'BAJO' ? 'bg-amber-500' : 'bg-red-500'
                                                        )}
                                                        style={{ width: `${stockPercent}%` }}
                                                    />
                                                </div>

                                                {/* Open Package Progress (Doses) */}
                                                {hasFractioning && (
                                                    <div className="flex flex-col items-center w-full mt-1">
                                                        <div className="w-full max-w-[80px] h-1 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                                                            <div
                                                                className="h-full bg-brand-400 dark:bg-brand-600 transition-all"
                                                                style={{ width: `${openPercent}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[8px] text-gray-400 mt-0.5 uppercase">Uso del {item.unitName}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-500">{item.minStock}</td>
                                        <td className="px-4 py-3 text-right hidden lg:table-cell text-gray-700 dark:text-gray-300">
                                            Q{Number(item.unitPrice).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={cn('badge text-[10px]', status.class)}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(item);
                                                    }}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(item.id, e)}
                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredInventory.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No se encontraron artículos</p>
                </div>
            )}

            <InventoryForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                currentItem={editingItem}
                onSuccess={() => {
                    loadInventory();
                }}
            />
        </div>
    );
}
