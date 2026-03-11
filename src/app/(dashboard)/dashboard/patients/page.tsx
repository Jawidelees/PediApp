'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Mail,
    Phone,
    Calendar,
    ChevronRight,
    Activity,
    CreditCard,
    Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPatients, deletePatient } from '@/actions/patient';
import Link from 'next/link';
import PatientRegistrationModal from '@/components/dashboard/PatientRegistrationModal';

type Patient = {
    id: string;
    phone: string | null;
    nit: string | null;
    birthDate: Date | null;
    user: {
        name: string;
        email: string;
    };
    _count: {
        appointments: number;
    };
};

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showRegistration, setShowRegistration] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const fetchPatients = async () => {
        setIsLoading(true);
        try {
            const data = await getPatients();
            setPatients(data as any);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirm(`¿Estás seguro que deseas eliminar permanentemente a ${name}? Esta acción borrará TODO su historial, citas y pagos. No se puede deshacer.`)) {
            setIsDeleting(id);
            try {
                const res = await deletePatient(id);
                if (res.success) {
                    await fetchPatients();
                } else {
                    alert(res.error || 'Error al eliminar');
                }
            } catch (err) {
                console.error(err);
                alert('Error de conexión');
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const filteredPatients = patients.filter((patient) =>
        patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone?.includes(searchQuery)
    );

    if (isLoading && patients.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <Activity className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Pacientes</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        {patients.length} expedientes activos en el sistema
                    </p>
                </div>
                <button
                    onClick={() => setShowRegistration(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs uppercase tracking-widest transition-all hover:shadow-glow"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Paciente
                </button>
            </div>

            {/* Search */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nombre, correo o teléfono..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium"
                />
            </div>

            {/* Patients Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPatients.map((patient) => (
                    <Link
                        key={patient.id}
                        href={`/dashboard/patients/${patient.id}`}
                        className={cn(
                            "group bg-white dark:bg-zinc-950 rounded-[2rem] border border-gray-100 dark:border-zinc-800 p-6 transition-all hover:border-brand-300 dark:hover:border-brand-900/50 hover:shadow-xl relative overflow-hidden flex flex-col justify-between",
                            isDeleting === patient.id && "opacity-50 pointer-events-none"
                        )}
                    >
                        {/* Delete Button */}
                        <button
                            onClick={(e) => handleDelete(e, patient.id, patient.user.name)}
                            disabled={isDeleting === patient.id}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-10"
                            title="Eliminar Paciente (Destructivo)"
                        >
                            {isDeleting === patient.id ? (
                                <Activity className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-xl shrink-0 group-hover:bg-brand-500 group-hover:text-white transition-all transform group-hover:scale-105">
                                {patient.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="space-y-1 min-w-0 pr-8">
                                <h3 className="font-black text-gray-900 dark:text-white truncate uppercase tracking-tight text-sm">{patient.user.name}</h3>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-brand-600 transition-colors">
                                    <CreditCard className="w-3 h-3" />
                                    <span>NIT: {patient.nit || 'CF'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-gray-400 group-hover:text-brand-500 transition-colors">
                                    <Mail className="w-3.5 h-3.5" />
                                </div>
                                <span className="truncate">{patient.user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-gray-400 group-hover:text-green-500 transition-colors">
                                    <Phone className="w-3.5 h-3.5" />
                                </div>
                                <span>{patient.phone || '—'}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50 dark:border-zinc-900 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/10 text-[9px] font-black text-brand-600 uppercase tracking-widest border border-brand-100 dark:border-brand-900/30">
                                    {patient._count.appointments} CONSULTAS
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all">
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredPatients.length === 0 && !isLoading && (
                <div className="text-center py-24 bg-gray-50/50 dark:bg-zinc-900/20 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-zinc-800">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-black text-gray-700 dark:text-zinc-400 uppercase tracking-tight">Sin resultados</h3>
                    <p className="text-sm text-gray-400 mt-2">No se encontraron pacientes bajo ese criterio de búsqueda.</p>
                </div>
            )}

            {/* Registration Modal */}
            {showRegistration && (
                <PatientRegistrationModal
                    onClose={() => setShowRegistration(false)}
                    onSuccess={() => {
                        setShowRegistration(false);
                        fetchPatients();
                    }}
                />
            )}
        </div>
    );
}
