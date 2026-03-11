'use client';

import { useState } from 'react';
import { submitClinicRegistration } from '@/actions/onboarding';
import { CheckCircle2, Building2 as Hospital, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form data
    const [clinicName, setClinicName] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await submitClinicRegistration({
                clinicName,
                contactName,
                contactEmail,
                contactPhone,
                notes
            });

            if (res.success) {
                setIsSuccess(true);
                window.scrollTo(0, 0);
            } else {
                setError(res.error || 'Ocurrió un error al enviar la solicitud.');
            }
        } catch (err: any) {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">¡Solicitud Enviada!</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                        Hemos recibido tu solicitud para digitalizar tu clínica. Revisaremos los datos y te enviaremos las credenciales de administrador a: <br />
                        <strong className="text-slate-900 dark:text-white mt-2 block bg-slate-100 dark:bg-slate-800 py-2 px-4 rounded-xl">{contactEmail}</strong>
                    </p>
                    <Link
                        href="/"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 py-12 selection:bg-primary/20">
            <div className="mb-10 text-center animate-fade-in">
                <Link href="/" className="inline-flex items-center gap-2 mb-6 group transition-all">
                    <div className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                        <Hospital className="w-7 h-7" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">SaaS Pediátrico</span>
                </Link>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Digitaliza tu Clínica</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">Únete a la plataforma líder para expedientes pediátricos en la nube.</p>
            </div>

            <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden border border-slate-100 dark:border-slate-800 animate-slide-up">
                <div className="p-8 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nombre de la Clínica *</label>
                                <input
                                    required
                                    value={clinicName}
                                    onChange={e => setClinicName(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="Ej. Pediatría Integral San Lucas"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Tu Nombre Completo *</label>
                                <input
                                    required
                                    value={contactName}
                                    onChange={e => setContactName(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="Dr. Juan Pérez"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Teléfono</label>
                                <input
                                    type="tel"
                                    value={contactPhone}
                                    onChange={e => setContactPhone(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="+502 0000 0000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Correo Electrónico (Para Admin) *</label>
                            <input
                                type="email"
                                required
                                value={contactEmail}
                                onChange={e => setContactEmail(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                                placeholder="admin@clinica.com"
                            />
                            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mt-2 ml-1">A este correo llegarán tus accesos iniciales</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Mensaje o Intereses (Opcional)</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium resize-none"
                                placeholder="¿Manejas algún esquema especial? Cuéntanos..."
                                rows={3}
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2 animate-shake">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-[1.25rem] shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-70 group"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Enviando solicitud...</span>
                                </>
                            ) : (
                                <>
                                    <span>Solicitar Acceso Admin</span>
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">rocket_launch</span>
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                                ¿Ya tienes una clínica? <span className="text-primary underline underline-offset-4">Inicia sesión aquí</span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            <p className="mt-12 text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                Certificado HIPAA & GDPR Compliant
            </p>
        </div>
    );
}
