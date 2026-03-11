'use client';

import React, { useState } from 'react';
import {
    X,
    UserPlus,
    User,
    Mail,
    Phone,
    MapPin,
    Hash,
    Calendar,
    Loader2,
    Activity,
    Copy,
    Check,
    CheckCircle2
} from 'lucide-react';
import { registerPatient } from '@/actions/patient';
import { cn } from '@/lib/utils';

interface PatientRegistrationModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function PatientRegistrationModal({ onClose, onSuccess }: PatientRegistrationModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState<{ identifier: string, password: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [noEmail, setNoEmail] = useState(false);
    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        username: string;
        phone: string;
        address: string;
        nit: string;
        birthDate: string;
        allergies: string;
        gestationalWeeks?: string;
        birthWeight?: string;
        birthHeight?: string;
        apgarScore?: string;
        perinatalNotes?: string;
    }>({
        name: '',
        email: '',
        username: '',
        phone: '',
        address: '',
        nit: '',
        birthDate: '',
        allergies: '',
        gestationalWeeks: '',
        birthWeight: '',
        birthHeight: '',
        apgarScore: '',
        perinatalNotes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSubmit = {
                ...formData,
                username: noEmail ? formData.username : undefined,
                email: noEmail ? undefined : formData.email,
                gestationalWeeks: formData.gestationalWeeks ? Number(formData.gestationalWeeks) : undefined,
                birthWeight: formData.birthWeight ? Number(formData.birthWeight) : undefined,
                birthHeight: formData.birthHeight ? Number(formData.birthHeight) : undefined,
            };
            const result = await registerPatient(dataToSubmit);
            if (result.success && result.credentials) {
                setRegistrationSuccess(result.credentials);
                // No cerramos de inmediato para mostrar las credenciales
            } else {
                alert('Error: ' + result.error);
            }
        } catch (err: any) {
            console.error(err);
            alert('Error crítico: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopy = () => {
        if (!registrationSuccess) return;
        const text = `Credenciales Clínica Pediátrica:\nUsuario: ${registrationSuccess.identifier}\nClave Temporal: ${registrationSuccess.password}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-xl rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-gray-50 dark:border-zinc-900 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-glow">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Nuevo Paciente</h3>
                            <p className="text-xs text-gray-500 font-medium tracking-tight">Registro de expediente base</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {registrationSuccess ? (
                        <div className="space-y-6 py-4 animate-in fade-in zoom-in duration-300">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">¡Paciente Registrado!</h4>
                                <p className="text-sm text-gray-500">Comparte estas credenciales con el paciente para su primer acceso.</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-zinc-900 rounded-[2rem] border border-gray-100 dark:border-zinc-800 p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Usuario / Correo</label>
                                    <div className="bg-white dark:bg-zinc-950 px-4 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 text-sm font-bold text-gray-700 dark:text-zinc-300">
                                        {registrationSuccess.identifier}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Clave Temporal</label>
                                    <div className="bg-brand-500/10 text-brand-600 px-4 py-4 rounded-2xl border border-brand-500/20 text-2xl font-black text-center tracking-[0.2em] shadow-inner">
                                        {registrationSuccess.password}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all",
                                        copied
                                            ? "bg-emerald-500 text-white shadow-glow"
                                            : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-[1.02]"
                                    )}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-5 h-5" />
                                            ¡COPIADO AL PORTAPAPELES!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-5 h-5" />
                                            COPIAR CREDENCIALES
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onSuccess();
                                        onClose();
                                    }}
                                    className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    CERRAR Y CONTINUAR
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Name */}
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <User className="w-3 h-3 text-brand-500" />
                                        Nombre Completo
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Juan Pérez"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all outline-none"
                                    />
                                </div>

                                {/* Email / Username */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <Mail className="w-3 h-3 text-brand-500" />
                                            {noEmail ? 'Nombre de Usuario' : 'Correo Electrónico'}
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input type="checkbox" checked={noEmail} onChange={(e) => {
                                                setNoEmail(e.target.checked);
                                                if (e.target.checked && !formData.username && formData.name) {
                                                    const generated = formData.name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 100);
                                                    setFormData({ ...formData, username: generated, email: '' });
                                                }
                                            }} className="w-3 h-3 text-brand-500 rounded focus:ring-brand-500" />
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-gray-700">Sin correo</span>
                                        </label>
                                    </div>
                                    {noEmail ? (
                                        <input
                                            required
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                                            placeholder="ej. juanperez123"
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all outline-none"
                                        />
                                    ) : (
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="paciente@mail.com"
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all outline-none"
                                        />
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Phone className="w-3 h-3 text-brand-500" />
                                        Teléfono
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="5555-0000"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all outline-none"
                                    />
                                </div>

                                {/* NIT */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Hash className="w-3 h-3 text-brand-500" />
                                        NIT (Facturación)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nit}
                                        onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                                        placeholder="NIT o C/F"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all outline-none"
                                    />
                                </div>

                                {/* BirthDate */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Calendar className="w-3 h-3 text-brand-500" />
                                        Fecha de Nacimiento
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all outline-none"
                                    />
                                </div>

                                {/* Address */}
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <MapPin className="w-3 h-3 text-brand-500" />
                                        Dirección de Residencia
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Zona, Municipio, Departamento"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all outline-none"
                                    />
                                </div>

                                {/* Allergies - Clinical Warning Style */}
                                <div className="col-span-2 space-y-1.5 p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                                    <label className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Activity className="w-3 h-3" />
                                        Alergias / Advertencias Médicas
                                    </label>
                                    <textarea
                                        value={formData.allergies}
                                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                        placeholder="Ninguna conocida / Penicilina, Látex, etc."
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-amber-200/50 dark:border-amber-900/50 bg-white/50 dark:bg-amber-950/20 text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all outline-none resize-none"
                                    />
                                </div>

                                {/* Perinatal Form Header */}
                                <div className="col-span-2 pt-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-brand-500" />
                                        Registro Perinatal (Opcional)
                                    </h4>
                                    <p className="text-[10px] font-medium text-gray-400 mt-1">Datos al nacer para expediente pediátrico.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                        Semanas Gestación
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.gestationalWeeks || ''}
                                        onChange={(e) => setFormData({ ...formData, gestationalWeeks: e.target.value })}
                                        placeholder="Ej: 39"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-brand-500/30 outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                        Peso al Nacer (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.birthWeight || ''}
                                        onChange={(e) => setFormData({ ...formData, birthWeight: e.target.value })}
                                        placeholder="Ej: 3.2"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-brand-500/30 outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                        Talla al Nacer (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.birthHeight || ''}
                                        onChange={(e) => setFormData({ ...formData, birthHeight: e.target.value })}
                                        placeholder="Ej: 50"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-brand-500/30 outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                        APGAR
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.apgarScore || ''}
                                        onChange={(e) => setFormData({ ...formData, apgarScore: e.target.value })}
                                        placeholder="Ej: 8/9"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-brand-500/30 outline-none"
                                    />
                                </div>

                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                        Tamizajes y Notas Perinatales
                                    </label>
                                    <textarea
                                        value={formData.perinatalNotes || ''}
                                        onChange={(e) => setFormData({ ...formData, perinatalNotes: e.target.value })}
                                        placeholder="Resultados de tamizaje neonatal, complicaciones en parto..."
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-brand-500/30 transition-all outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-2xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-2.5 rounded-2xl bg-brand-500 text-white text-xs font-black shadow-glow flex items-center gap-2 hover:bg-brand-600 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="w-4 h-4" />
                                    )}
                                    REGISTRAR PACIENTE
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
