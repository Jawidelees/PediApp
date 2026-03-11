'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, Building2, Users, Bell, Shield, Palette, Activity, Database } from 'lucide-react';

const settingsSections = [
    { icon: Building2, title: 'Información de la Clínica', desc: 'Nombre, dirección, NIT, logo y datos fiscales' },
    { icon: Users, title: 'Usuarios y Roles', desc: 'Gestionar doctores, recepcionistas y permisos', href: '/dashboard/settings/users' },
    { icon: Bell, title: 'Notificaciones', desc: 'Alertas de stock bajo, recordatorios de citas' },
    { icon: Shield, title: 'Seguridad', desc: 'Cambiar contraseña, sesiones activas' },
    { icon: Palette, title: 'Apariencia', desc: 'Tema claro/oscuro, personalización visual' },
    { icon: Activity, title: 'Servicios Clínicos', desc: 'Configurar servicios, terapias y sus costos', href: '/dashboard/settings/services' },
    { icon: Database, title: 'Respaldo de Datos', desc: 'Generar y descargar copia de seguridad del sistema', href: '/dashboard/settings/backup' },
];

export default function SettingsPage() {
    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ajustes</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Configuración del sistema
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {settingsSections.map((section) => (
                    <Link
                        key={section.title}
                        href={section.href || '#'}
                        className="card-premium p-5 text-left group w-full block"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/40 transition-colors">
                                <section.icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{section.desc}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
