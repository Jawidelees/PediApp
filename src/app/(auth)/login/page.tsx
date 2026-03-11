import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getClinicBySlug } from '@/lib/tenant';
import LoginForm from './LoginForm';

export default async function LoginPage() {
    const headersList = await headers();
    const clinicSlug = headersList.get('x-clinic-slug');

    // Fetch clinic data if a slug is present
    const clinic = clinicSlug ? await getClinicBySlug(clinicSlug) : null;

    const clinicName = clinic?.name || 'Clínica Pediátrica';
    const clinicLogo = clinic?.logoUrl;

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100">
            <header className="flex items-center bg-white dark:bg-background-dark p-4 justify-between border-b border-primary/10">
                <div className="flex items-center gap-2">
                    <div className="text-primary flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 rounded-lg">
                        {clinicLogo ? (
                            <img src={clinicLogo} alt={clinicName} className="h-8 w-auto object-contain" />
                        ) : (
                            <span className="material-symbols-outlined text-2xl">child_care</span>
                        )}
                    </div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">{clinicName}</h1>
                </div>
                <div className="hidden md:flex gap-4">
                    <button className="text-sm font-medium text-primary hover:text-primary/80">Soporte</button>
                    <button className="text-sm font-medium text-primary hover:text-primary/80">Privacidad</button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5">
                        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern height="40" id="smallGrid" patternUnits="userSpaceOnUse" width="40">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"></path>
                                </pattern>
                            </defs>
                            <rect fill="url(#smallGrid)" height="100%" width="100%"></rect>
                        </svg>
                    </div>
                </div>

                <div className="w-full max-w-md z-10 transition-all duration-500 hover:scale-[1.01]">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border border-primary/20">
                        <LoginForm clinicName={clinicName} clinicLogo={clinicLogo} />

                        <div className="bg-primary/5 dark:bg-primary/10 px-6 py-4 flex items-center justify-center gap-2 border-t border-primary/10">
                            <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
                            <span className="text-[10px] uppercase font-bold text-primary/80 tracking-widest">Tecnología de Grado Médico — Encriptación AES-256</span>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <Link className="hover:text-primary" href="#">Soporte Técnico</Link>
                        <Link className="hover:text-primary" href="#">Términos de Servicio</Link>
                        <Link className="hover:text-primary" href="#">Cumplimiento HIPAA</Link>
                    </div>
                </div>
            </main>

            <footer className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                © {new Date().getFullYear()} {clinicName}. Todos los derechos reservados. Gestión clínica hecha simple.
            </footer>
        </div>
    );
}
