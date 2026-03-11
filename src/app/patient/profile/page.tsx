'use client';

import React, { useState, useEffect } from 'react';
import { getPatientProfile, updatePatientProfile, updatePatientCredentials } from '@/actions/patient';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientProfilePage() {
    const { data: session, update: updateSession } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        username: '',
    });

    const [password, setPassword] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getPatientProfile();
                if (data) {
                    setFormData({
                        name: data.user.name || '',
                        phone: data.phone || '',
                        email: data.user.email || '',
                        username: data.user.username || '',
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Update profile info
            const pRes = await updatePatientProfile({
                name: formData.name,
                phone: formData.phone,
            });

            if (!pRes.success) throw new Error(pRes.error);

            // Update credentials
            const credRes = await updatePatientCredentials({
                email: formData.email,
                username: formData.username,
                password: password || undefined
            });

            if (!credRes.success) throw new Error(credRes.error);

            if (password) setPassword('');

            // Sync session
            await updateSession();

            toast.success("Perfil actualizado con excelencia.");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al actualizar el perfil");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold">Ajustes de Perfil</h1>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="text-primary font-semibold text-sm flex items-center gap-1 disabled:opacity-50">
                    {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                    Guardar
                </button>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Parent Profile Section */}
                <section className="mb-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-primary/20 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDX0eLFN1Z3vvxmrdAc2NZ3xn-y30GBXRNkoOG1ReO2eu1YqxcJS9dy2lsGBdGoMfvMKjPAMMCnq4M4r9P5dnBv4Xh5WddDgj1A1eoZ1qdpxJ8LjokGgFrZkjh9XFce3m3HsM0bLMMjrPOem3A8H0ezvb1PK8M5P7JFsTM6M6zryV4EOfG-fWA2cTVIscGnYKXOdiQAGXZkal2rkvsceix5uzYu0Lz5_KHEr-ITF9nksi07UIgNw1ud8DdqLmQtkGbC9A_-jkVeiJKe')" }}></div>
                            <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-background-dark">
                                <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                        </div>
                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{formData.name || session?.user?.name || 'Usuario'}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold px-1">Nombre Completo</label>
                            <input
                                className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-12 px-4"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold px-1">Número de Teléfono</label>
                            <input
                                className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-12 px-4"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold px-1 text-slate-700 dark:text-slate-300">Correo Electrónico</label>
                            <input
                                className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-12 px-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold px-1 text-slate-700 dark:text-slate-300">Nombre de Usuario (Para Login)</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">alternate_email</span>
                                <input
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-12 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    type="text"
                                    placeholder="usuario_secreto"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <p className="text-xs text-slate-500 px-1 mt-1">Usa esto como alternativa si no tienes acceso a tu correo.</p>
                        </div>
                    </div>
                </section>

                {/* Children's Profiles Section */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Hijos</h2>
                        <button className="flex items-center gap-1 text-primary text-sm font-bold">
                            <span className="material-symbols-outlined text-base">add_circle</span>
                            Añadir Hijo
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Child 1 */}
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-cover bg-center bg-primary/10" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAaitYHgShX_jmXMzpTo5RFvBSwlsssQwFT016aWN1Dv_cxH8RYLHx76nRBILAJPzz2pgvx-uJqbitK929Mv36Z3yVSqMch-0GWsTB_gzMoBMqCJwXUAUHNlzRT4WwBjZCl_VKslUJ12rM_jYtIxW0BlysRY_lufBsEAZE8cfh2bI40u4XaCtWb_vZuwkS_85aiGYU5QBeN73kVU5XoE8HRKDEU6659_iVrDZWJANYD3eeK3jscqn0Uq8c7kseABmSwfL1hI8AUk988')" }}></div>
                                <div>
                                    <p className="font-bold">Leo Jenkins</p>
                                    <p className="text-xs text-slate-500">Nacido: Jun 12, 2021</p>
                                </div>
                            </div>
                            <button className="text-slate-400">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                        {/* Child 2 */}
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-cover bg-center bg-primary/10" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZ3I9KQeVF7-bRL6buwx7nXYXetaJTIRd2xBXMZMbZSKkVZZrHpo_A4kocX4RwXdj4ob6SXemH7pkJwzgzJPxpqceaKvGGLMOAvjyxdkK7k2_Kaed_BO0HD93keND3356UW-ls_IIJqH_akT6JEQYZMVoDgVOF8CsFZ_Q1WcuYT1NLODfbU10ltm9aXMFpijXLMLeWA3AfsQZ9NbnUA_w1DRDb1KoZdHlpLFfgzkOE7K_2yGa1UKdaYzanLXzqlnnXu4cVIrZZ7BT4')" }}></div>
                                <div>
                                    <p className="font-bold">Mia Jenkins</p>
                                    <p className="text-xs text-slate-500">Nacida: Ene 04, 2018</p>
                                </div>
                            </div>
                            <button className="text-slate-400">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Security Settings Section */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-4">Seguridad</h2>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                        <div className="w-full flex-col items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-slate-500">lock</span>
                                <span className="font-medium">Cambiar Contraseña</span>
                            </div>
                            <input
                                className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-10 px-4 mt-2 text-sm"
                                type="password"
                                placeholder="Nueva contraseña (dejar en blanco para omitir)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="w-full flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-500">fingerprint</span>
                                <div>
                                    <p className="font-medium">Inicio de sesión Biométrico</p>
                                    <p className="text-xs text-slate-500">Usa FaceID o Huella</p>
                                </div>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input defaultChecked className="sr-only peer" type="checkbox" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </div>
                        </div>
                        <div className="w-full flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-500">verified_user</span>
                                <div>
                                    <p className="font-medium">Autenticación de 2 Factores</p>
                                    <p className="text-xs text-slate-500">Protege tu cuenta</p>
                                </div>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input className="sr-only peer" type="checkbox" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="pb-10">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full py-4 text-red-500 font-bold border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 rounded-xl hover:scale-105 transition-transform"
                    >
                        Cerrar Sesión
                    </button>
                </section>
            </div>
        </>
    );
}
