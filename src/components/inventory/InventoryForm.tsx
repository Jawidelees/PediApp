'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    X,
    Save,
    AlertTriangle,
    Loader2,
    Search,
    Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createInventoryItem, updateInventoryItem } from '@/actions/inventory';
import { useRouter } from 'next/navigation';

// Schema Validation
const inventorySchema = z.object({
    name: z.string().min(2, 'El nombre es requerido'),
    sku: z.string().optional(),
    description: z.string().optional(),
    unitsPerPackage: z.number().min(1, 'Mínimo 1 unidad por paquete'),
    unitName: z.string().min(1, 'Requerido (ej: Frasco)'),
    baseUnitName: z.string().min(1, 'Requerido (ej: Dosis)'),
    minStock: z.number().min(0, 'No puede ser negativo'),
    stock: z.number().min(0, 'No puede ser negativo'),
    unitPrice: z.number().min(0, 'Precio no puede ser negativo'),
    costPrice: z.number().min(0, 'Costo no puede ser negativo'),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    currentItem?: any; // If editing
    onSuccess: () => void;
}

export default function InventoryForm({ isOpen, onClose, currentItem, onSuccess }: InventoryFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<InventoryFormData>({
        resolver: zodResolver(inventorySchema),
        defaultValues: {
            unitsPerPackage: 1,
            unitName: 'Unidad',
            baseUnitName: 'Unidad',
            minStock: 5,
            stock: 0,
            unitPrice: 0,
            costPrice: 0
        }
    });

    // Load data if editing
    useEffect(() => {
        if (currentItem) {
            reset({
                name: currentItem.name,
                sku: currentItem.sku || '',
                description: currentItem.description || '',
                unitsPerPackage: currentItem.unitsPerPackage,
                unitName: currentItem.unitName,
                baseUnitName: currentItem.baseUnitName,
                minStock: currentItem.minStock,
                stock: currentItem.stock,
                unitPrice: Number(currentItem.unitPrice),
                costPrice: Number(currentItem.costPrice),
            });
        } else {
            reset({
                unitsPerPackage: 1,
                unitName: 'Unidad',
                baseUnitName: 'Unidad',
                minStock: 5,
                stock: 0,
                unitPrice: 0,
                costPrice: 0
            });
        }
    }, [currentItem, reset]);

    const onSubmit = async (data: InventoryFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            let result;
            if (currentItem) {
                // Update
                result = await updateInventoryItem(currentItem.id, data);
            } else {
                // Create
                result = await createInventoryItem({
                    ...data,
                    initialStock: data.stock // Needed for creation
                });
            }

            if (!result.success) {
                throw new Error(result.error);
            }

            onSuccess();
            onClose();
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el artículo');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-brand-500" />
                        {currentItem ? 'Editar Artículo' : 'Nuevo Artículo'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Basic Info */}
                        <div className="col-span-2 space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Información Básica</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nombre del Producto <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register('name')}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        placeholder="Ej: Paracetamol 500mg"
                                    />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        SKU / Código
                                    </label>
                                    <input
                                        {...register('sku')}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Descripción / Categoría
                                </label>
                                <input
                                    {...register('description')}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                    placeholder="Ej: Analgésico, Jarabe..."
                                />
                            </div>
                        </div>

                        {/* Units & Logic */}
                        <div className="col-span-2 pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Unidades y Presentación</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Presentación
                                    </label>
                                    <input
                                        {...register('unitName')}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        placeholder="Ej: Caja, Frasco"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Und. Base
                                    </label>
                                    <input
                                        {...register('baseUnitName')}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        placeholder="Ej: Tableta, ml"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Cant. por Paquete
                                    </label>
                                    <input
                                        type="number"
                                        {...register('unitsPerPackage', { valueAsNumber: true })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Inventory & Pricing */}
                        <div className="col-span-2 pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Inventario y Costos</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Stock Inicial
                                    </label>
                                    <input
                                        type="number"
                                        {...register('stock', { valueAsNumber: true })}
                                        // Disable stock edit if existing item (should use "add stock" action instead, but allowing edit for now facilitates corrections)
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Stock Mínimo
                                    </label>
                                    <input
                                        type="number"
                                        {...register('minStock', { valueAsNumber: true })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Costo (Q)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('costPrice', { valueAsNumber: true })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Precio Público (Q)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('unitPrice', { valueAsNumber: true })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Guardar Artículo
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
