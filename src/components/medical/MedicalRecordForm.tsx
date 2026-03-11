'use client';

import React, { useState, useEffect } from 'react';
import {
    Activity,
    Loader2,
    CheckCircle2,
    Heart,
    Plus,
    X,
    ClipboardList,
    Search,
    Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveMedicalRecord, createExpressAppointment } from '@/actions/records';
import { getServices } from '@/actions/billing';
import { getInventory } from '@/actions/inventory';
import { supabase } from '@/lib/supabase';
import { ImagePlus, Trash2 } from 'lucide-react';

interface MedicalRecordFormProps {
    appointmentId?: string; // Optional for express notes
    patientId: string;
    patientName: string;
    onClose: () => void;
    onSuccess: () => void;
    isExpress?: boolean;
}

export default function MedicalRecordForm({
    appointmentId,
    patientId,
    patientName,
    onClose,
    onSuccess,
    isExpress = false
}: MedicalRecordFormProps) {
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [prescription, setPrescription] = useState('');
    const [clinicalNotes, setClinicalNotes] = useState<string>('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // New states for Phase 19
    const [services, setServices] = useState<any[]>([]);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [selectedMedications, setSelectedMedications] = useState<Array<{ id: string, name: string, quantity: number, price: number }>>([]);
    const [medSearch, setMedSearch] = useState('');

    useEffect(() => {
        const loadData = async () => {
            const [sData, iData] = await Promise.all([getServices(), getInventory()]);
            setServices(sData.filter(s => s.active));
            setInventoryItems(iData);
        };
        loadData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let result;
            if (isExpress) {
                // For express, the action creates both appointment and record
                result = await createExpressAppointment({
                    patientId,
                    diagnosis,
                    notes,
                    prescription,
                    aiAdvice: '', // AI Advice removed
                    painMap: [] as any, // Placeholder for clinical notes
                    serviceId: selectedServiceId || services[0]?.id,
                });
            } else {
                if (!appointmentId) throw new Error("ID de cita requerido para guardado normal");
                result = await saveMedicalRecord({
                    appointmentId,
                    patientId,
                    diagnosis,
                    notes,
                    prescription,
                    aiAdvice: '',
                    painMap: [] as any,
                    photos,
                    serviceId: selectedServiceId,
                    medications: selectedMedications
                } as any);
            }

            if (result.success) {
                onSuccess();
            }
        } catch (error) {
            console.error(error);
            alert('Error al guardar el registro');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;
            const file = event.target.files[0];

            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${patientId}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('medical-records')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('medical-records')
                .getPublicUrl(filePath);

            setPhotos([...photos, data.publicUrl]);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir la imagen.');
        } finally {
            setIsUploading(false);
            if (event.target) event.target.value = ''; // Reset input
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const addMedication = (item: any) => {
        const existing = selectedMedications.find(m => m.id === item.id);
        if (existing) {
            setSelectedMedications(selectedMedications.map(m =>
                m.id === item.id ? { ...m, quantity: m.quantity + 1 } : m
            ));
        } else {
            setSelectedMedications([...selectedMedications, {
                id: item.id,
                name: item.name,
                quantity: 1,
                price: Number(item.unitPrice)
            }]);
        }
    };

    const removeMedication = (id: string) => {
        setSelectedMedications(selectedMedications.filter(m => m.id !== id));
    };

    const selectedService = services.find(s => s.id === selectedServiceId);
    const estimatedTotal = (selectedService?.price || 0) + selectedMedications.reduce((sum, med) => sum + (med.price * med.quantity), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in no-print">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-5xl rounded-[3rem] border border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-scale-in">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-glow">
                                <Stethoscope className="w-4 h-4 md:w-6 md:h-6" />
                            </div>
                            <div>
                                <h2 className="text-base md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                                    {isExpress ? 'Consulta Express' : 'Nueva Nota Médica'}
                                </h2>
                                <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Paciente: {patientName}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 md:p-3 bg-white dark:bg-zinc-900 rounded-xl md:rounded-2xl border border-gray-100 dark:border-zinc-800 hover:bg-gray-100 transition-colors">
                        <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar">
                    <form id="medical-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Clinical Section */}
                        <div className="lg:col-span-12 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        Servicio Realizado
                                    </label>
                                    <select
                                        value={selectedServiceId}
                                        onChange={(e) => setSelectedServiceId(e.target.value)}
                                        className="w-full p-4 rounded-3xl bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-brand-500 outline-none text-sm font-bold uppercase tracking-tight transition-all"
                                        required
                                    >
                                        <option value="">Seleccionar Servicio...</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} - Q{Number(s.price).toFixed(2)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        Diagnóstico Principal
                                    </label>
                                    <input
                                        type="text"
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                        placeholder="Ej. Lumbalgia Mecánica Crónica"
                                        className="w-full p-4 rounded-3xl bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-brand-500 outline-none text-sm font-bold transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nota de Evolución</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={4}
                                        className="w-full p-4 p-6 rounded-[1.5rem] md:rounded-[2rem] bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-brand-500 outline-none text-sm leading-relaxed transition-all resize-none"
                                        placeholder="Detalles de la sesión..."
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tratamiento / Receta</label>
                                    <textarea
                                        value={prescription}
                                        onChange={(e) => setPrescription(e.target.value)}
                                        rows={4}
                                        className="w-full p-6 rounded-[1.5rem] md:rounded-[2rem] bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-brand-500 outline-none text-sm leading-relaxed transition-all resize-none"
                                        placeholder="Medicamentos externos..."
                                    />
                                </div>
                            </div>

                            {/* Photo Upload Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <ImagePlus className="w-4 h-4 text-brand-500" />
                                    Imágenes Clínicas / Radiografías
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {photos.map((url, i) => (
                                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 group">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt={`Evidencia clínica ${i + 1}`} className="object-cover w-full h-full" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-colors">
                                        {isUploading ? (
                                            <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="w-6 h-6 text-gray-400 mb-2" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Añadir Foto</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Inventory & Medications Divider */}
                        <div className="lg:col-span-12 border-t border-gray-100 dark:border-zinc-900 pt-10">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <ClipboardList className="w-5 h-5 text-brand-500" />
                                Insumos y Farmacia
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={medSearch}
                                            onChange={(e) => setMedSearch(e.target.value)}
                                            placeholder="Buscar medicamento en inventario..."
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-brand-500 outline-none text-xs"
                                        />
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                                        {inventoryItems.filter(i => i.name.toLowerCase().includes(medSearch.toLowerCase())).map(item => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => addMedication(item)}
                                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-50 dark:border-zinc-900 hover:border-brand-300 transition-all group"
                                            >
                                                <div className="text-left">
                                                    <p className="text-xs font-black uppercase text-gray-800 dark:text-white">{item.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">Stock: {item.stock} {item.baseUnitName}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-brand-600">Q{Number(item.unitPrice).toFixed(2)}</span>
                                                    <Plus className="w-4 h-4 text-gray-300 group-hover:text-brand-500" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-[2rem] p-8 space-y-6 border border-gray-100 dark:border-zinc-800">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-zinc-800 pb-2">Seleccionados para esta cuenta</p>
                                    <div className="space-y-3">
                                        {selectedMedications.map(med => (
                                            <div key={med.id} className="flex items-center justify-between bg-white dark:bg-zinc-950 p-3 rounded-xl border border-gray-50 dark:border-zinc-900">
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black uppercase text-gray-700 dark:text-zinc-200">{med.name}</p>
                                                    <p className="text-[9px] text-gray-400">Q{med.price.toFixed(2)} x {med.quantity}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-black text-gray-900 dark:text-white">Q{(med.price * med.quantity).toFixed(2)}</span>
                                                    <button onClick={() => removeMedication(med.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedMedications.length === 0 && (
                                            <p className="text-center py-8 text-[10px] text-gray-400 font-black uppercase tracking-widest">No se han añadido insumos</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Notes Section */}
                        <div className="lg:col-span-12 border-t border-gray-100 dark:border-zinc-900 pt-10">
                            <div className="flex items-center justify-between mb-8 px-4">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-brand-500" />
                                    Observaciones Clínicas Adicionales
                                </h3>
                            </div>
                            <textarea
                                value={clinicalNotes}
                                onChange={(e) => setClinicalNotes(e.target.value)}
                                rows={4}
                                className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-brand-500 outline-none text-sm leading-relaxed transition-all resize-none"
                                placeholder="Observaciones adicionales sobre el paciente pediátrico..."
                            />
                        </div>

                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-4 md:p-8 border-t border-gray-50 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="text-left">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Estimado</p>
                            <p className="text-xl md:text-3xl font-black text-emerald-600 tracking-tighter leading-none mt-1">
                                Q{estimatedTotal.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:flex gap-3 md:gap-4">
                        <button type="button" onClick={onClose} className="px-4 md:px-8 py-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-500 text-[9px] md:text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                            Cancelar
                        </button>
                        <button
                            form="medical-form"
                            type="submit"
                            disabled={isSaving}
                            className="px-6 md:px-12 py-4 rounded-2xl bg-brand-500 text-white text-[9px] md:text-[11px] font-black uppercase tracking-widest shadow-glow hover:bg-brand-600 transition-all flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            {isExpress ? 'Finalizar' : 'Guardar Ficha'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
