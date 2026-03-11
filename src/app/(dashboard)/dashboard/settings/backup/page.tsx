'use client';

import React, { useState } from 'react';
import { Database, Download, ArrowLeft, ShieldCheck, AlertTriangle, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { resetDatabase } from '@/actions/reset';
import { useRouter } from 'next/navigation';

export default function BackupPage() {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const router = useRouter();

    const handleBackup = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch('/api/backup', { method: 'GET' });
            if (!response.ok) throw new Error('Error al generar respaldo');

            // Trigger file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clinica_pediatrica_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Backup failed:', error);
            alert('Oh no, hubo un error al generar el respaldo. Verifique que sea Administrador.');
        } finally {
            setIsDownloading(false);
        }
    }

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/settings"
                    className="p-2 rounded-xl hover:bg-white dark:hover:bg-zinc-900 text-gray-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Respaldo de Datos</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Proteja su información descargando copias locales de la base de datos
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8 shadow-sm">
                <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500 mb-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <Database className="w-10 h-10" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generar Copia de Seguridad</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Este proceso extraerá y comprimirá absolutamente toda la información actual de la clínica (pacientes, citas, registros médicos, facturación e inventario) en un archivo <code className="bg-gray-100 dark:bg-zinc-800 px-1 rounded">.json</code>. Guárdelo en un lugar seguro.
                    </p>

                    <div className="flex flex-col w-full mt-4">
                        <button
                            onClick={handleBackup}
                            disabled={isDownloading}
                            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white p-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-500/20"
                        >
                            {isDownloading ? (
                                <span className="animate-pulse">Estructurando Base de Datos...</span>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Descargar Backup (.JSON)
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex items-start gap-3 justify-center text-left w-full mt-4 p-4 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl text-orange-800 dark:text-orange-400 text-xs">
                        <AlertTriangle className="w-10 h-10 shrink-0 opacity-80" />
                        <div className="flex flex-col">
                            <strong className="text-sm mb-1 uppercase tracking-wider">Información Confidencial</strong>
                            <p className="text-orange-700 dark:text-orange-300">
                                Los respaldos contienen historiales médicos y datos sensibles sujetos a leyes de privacidad. Asegúrese de guardar el archivo descargado en un entorno cifrado o resguardado físicamente. No lo envíe por plataformas no seguras.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Acción Registrada Exclusivamente para Administradores
                    </div>
                </div>
            </div>

            {/* DANGER ZONE - FACTORY RESET */}
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-red-100 dark:border-red-900/30 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full pointer-events-none" />

                <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 mb-2 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                        <Trash2 className="w-10 h-10" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-500 mb-1">Zona de Peligro</h2>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Restablecimiento de Fábrica (Lanzamiento)</h3>
                    </div>

                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Esta acción está diseñada para <strong>limpiar el sistema antes de un lanzamiento oficial</strong>. Eliminará permanentemente a <strong>todos los pacientes, citas, historiales médicos, inventarios descontados y facturación</strong>. <br /><br />
                        <span className="text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-zinc-900 p-1 rounded font-medium">Se Preservarán:</span> Cuentas de Administradores/Doctores, Catálogo de Servicios e Insumos Maestros (aunque el stock volverá a ser 0).
                    </p>

                    <button
                        onClick={() => setShowResetModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-900/50 p-4 rounded-xl font-bold transition-all shadow-sm"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        Iniciar Purgado de Base de Datos
                    </button>
                </div>
            </div>

            {/* RESET MODAL */}
            {showResetModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border-t-4 border-t-red-500">
                        <button
                            onClick={() => setShowResetModal(false)}
                            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-zinc-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-2 animate-pulse">
                                <AlertTriangle className="w-8 h-8" />
                            </div>

                            <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                ¿Borrar todo e iniciar<br />de cero?
                            </h3>

                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                                Todos los expedientes y cuentas de prueba o falsas serán eliminadas. <strong>Esta acción es irreversible y no puede deshacerse sin solicitar un Restore de Backup a IT.</strong>
                            </p>

                            <div className="w-full mt-4 p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                    Para confirmar, escriba &quot;ELIMINAR TODO&quot;
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="ELIMINAR TODO"
                                    disabled={isResetting}
                                    className="w-full text-center font-mono font-bold text-red-600 dark:text-red-400 bg-white dark:bg-zinc-900 border-2 border-red-200 dark:border-red-900/50 rounded-lg p-3 placeholder-red-200 dark:placeholder-red-900/30 focus:border-red-500 focus:outline-none transition-colors"
                                />
                            </div>

                            <button
                                disabled={confirmText !== 'ELIMINAR TODO' || isResetting}
                                onClick={async () => {
                                    setIsResetting(true);
                                    try {
                                        const res = await resetDatabase(confirmText);
                                        if (res?.success) {
                                            alert('Base de Datos limpiada exitosamente. El sistema está ahora Cero Kilómetros listo para el lanzamiento.');
                                            setShowResetModal(false);
                                            router.refresh(); // Reload to show 0 metrics
                                        } else {
                                            alert(res?.error || 'Falló el reinicio de fábrica.');
                                        }
                                    } catch (err) {
                                        alert('Error crítico de red.');
                                    } finally {
                                        setIsResetting(false);
                                    }
                                }}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-zinc-800 text-white font-bold p-4 rounded-xl mt-4 transition-colors disabled:cursor-not-allowed uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                            >
                                {isResetting ? (
                                    <span className="animate-pulse">Borrando Datos...</span>
                                ) : (
                                    <>
                                        <Trash2 className="w-5 h-5" />
                                        Purgar Sistema
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
