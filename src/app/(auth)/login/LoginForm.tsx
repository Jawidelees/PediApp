'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
    clinicName: string;
    clinicLogo?: string | null;
}

export default function LoginForm({ clinicName, clinicLogo }: LoginFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tab, setTab] = useState<'parent' | 'staff'>('parent');
    const [forgotMessage, setForgotMessage] = useState(false);

    const handleForgotPassword = () => {
        if (!email) {
            setError('Por favor ingresa tu correo primero.');
            return;
        }
        setError('');
        setForgotMessage(true);
        setTimeout(() => setForgotMessage(false), 5000); // Hide after 5 seconds
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Credenciales incorrectas. Intenta de nuevo.');
            } else if (result?.ok) {
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="relative h-48 w-full bg-primary/5 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    {clinicLogo ? (
                        <img src={clinicLogo} alt={clinicName} className="h-24 w-auto object-contain opacity-40" />
                    ) : (
                        <span className="material-symbols-outlined text-8xl text-primary/20">medical_services</span>
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>
                <div className="absolute bottom-4 left-0 right-0 text-center px-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bienvenido de Nuevo</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Accediendo a {clinicName}</p>
                </div>
            </div>

            <div className="px-6 py-4">
                <div className="flex h-12 w-full items-center justify-center rounded-xl bg-primary/5 dark:bg-primary/10 p-1 mb-8">
                    <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-800 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-semibold transition-all">
                        <span className="truncate">Acceso Padres</span>
                        <input
                            checked={tab === 'parent'}
                            onChange={() => { setTab('parent'); setError(''); setForgotMessage(false); }}
                            className="hidden"
                            name="login-type"
                            type="radio"
                            value="parent"
                        />
                    </label>
                    <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-800 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-semibold transition-all">
                        <span className="truncate">Personal Médico</span>
                        <input
                            checked={tab === 'staff'}
                            onChange={() => { setTab('staff'); setError(''); setForgotMessage(false); }}
                            className="hidden"
                            name="login-type"
                            type="radio"
                            value="staff"
                        />
                    </label>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            {tab === 'parent' ? 'Correo Electrónico (Padre/Tutor)' : 'Correo o ID Médico'}
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">alternate_email</span>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary/20 dark:border-primary/30 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                placeholder={tab === 'parent' ? "papa@ejemplo.com" : "dr.apellido@clinicamente.com"}
                                type="text"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contraseña</label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-xs font-semibold text-primary hover:underline"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary/20 dark:border-primary/30 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                                type="password"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-1">
                        <input className="rounded border-primary/30 text-primary focus:ring-primary" id="remember" type="checkbox" />
                        <label className="text-sm text-slate-600 dark:text-slate-400 select-none cursor-pointer" htmlFor="remember">Recordar en este dispositivo</label>
                    </div>

                    {forgotMessage && (
                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium text-center transition-all animate-fade-in">
                            ¡Enlace enviado! Revisa tu bandeja de entrada.
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center animate-fade-in">
                            {error}
                        </div>
                    )}

                    <button
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Iniciando...
                            </>
                        ) : (
                            <>
                                <span>Iniciar Sesión {tab === 'parent' ? 'Padre' : 'Médico'}</span>
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </>
                        )}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 font-bold tracking-widest">o continuar con</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold text-slate-700 dark:text-slate-200 shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google Hub
                    </button>
                </form>
            </div>
        </>
    );
}
