'use client';

import { BentoGrid, BentoCard } from './BentoGrid';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ReactLenis } from '@studio-freight/react-lenis';
import LoginForm from '@/app/(auth)/login/LoginForm';

const fadeIn = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const FEATURES = [
    {
        title: 'Expediente Pediátrico',
        description: 'Gestión integral de la historia clínica con enfoque en el desarrollo infantil.',
        image: '/assets/stitch/expediente.png',
        className: 'lg:col-span-8 lg:row-span-2',
    },
    {
        title: 'Esquema de Vacunación',
        description: 'Seguimiento automatizado y recordatorios de vacunas por edad.',
        image: '/assets/stitch/vacunas.png',
        className: 'lg:col-span-4 lg:row-span-1',
    },
    {
        title: 'Dashboard para Padres',
        description: 'Una interfaz amigable para que las familias gestionen la salud de sus hijos.',
        image: '/assets/stitch/dashboard_padres.png',
        className: 'lg:col-span-4 lg:row-span-1',
    },
    {
        title: 'Receta Digital',
        description: 'Emisión de recetas claras y profesionales listas para la farmacia.',
        image: '/assets/stitch/receta.png',
        className: 'lg:col-span-4 lg:row-span-1',
    },
    {
        title: 'Agenda Inteligente',
        description: 'Control total de citas y recordatorios automáticos para evitar inasistencias.',
        image: '/assets/stitch/agenda.png',
        className: 'lg:col-span-4 lg:row-span-1',
    },
    {
        title: 'Registro Perinatal',
        description: 'Documentación detallada desde el primer segundo de vida.',
        image: '/assets/stitch/perinatal.png',
        className: 'lg:col-span-4 lg:row-span-1',
    }
];

export default function LandingClient() {
    // No longer need local showPassword as it's handled in LoginForm

    return (
        <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
            <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 selection:bg-primary/20 selection:text-primary">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary text-white p-2 rounded-lg">
                                    <span className="material-symbols-outlined block">health_and_safety</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Clínica Pediátrica</span>
                            </div>
                            <div className="hidden md:flex items-center gap-8">
                                <a className="text-sm font-medium hover:text-primary transition-colors" href="#features">Características</a>
                                <a className="text-sm font-medium hover:text-primary transition-colors" href="#login">Portal de Clientes</a>
                                <Link href="/register" className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm">
                                    Digitalice su Clínica
                                </Link>
                            </div>
                            <div className="md:hidden">
                                <span className="material-symbols-outlined text-slate-600">menu</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <header className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div initial="initial" animate="animate" variants={fadeIn} className="flex flex-col gap-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider w-fit">
                                    <span className="material-symbols-outlined text-sm">child_care</span>
                                    La App de Pediatría más amigable para las familias
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                                    El cuidado de tus <span className="text-primary">hijos</span>,<br />
                                    ahora en tu <span className="text-primary">bolsillo</span>.
                                </h1>
                                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                                    Una plataforma cálida y eficiente que acompaña el crecimiento de los más pequeños. Conecta con tu pediatra de forma simple y segura.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link href="/register" className="px-10 py-5 bg-primary text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-all flex items-center gap-2">
                                        Solicitar Acceso Admin
                                        <span className="material-symbols-outlined">rocket_launch</span>
                                    </Link>
                                    <a href="#login" className="px-10 py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] font-bold text-lg hover:bg-slate-50 transition-all text-slate-700 dark:text-slate-200">
                                        Iniciar Sesión
                                    </a>
                                </div>
                                <div className="flex items-center gap-6 pt-4 opacity-60">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-slate-900 dark:text-white">OMS</span>
                                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Gráficas Oficiales</span>
                                    </div>
                                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-slate-900 dark:text-white">HIPAA</span>
                                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Privacidad Total</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: "easeOut" }} className="relative">
                                <div className="absolute -inset-10 bg-gradient-to-tr from-primary/30 to-secondary/30 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                                <div className="relative">
                                    <img
                                        src="/assets/hero-friendly.png"
                                        alt="Friendly Pediatric Care"
                                        className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[3rem]"
                                    />

                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3"
                                    >
                                        <div className="bg-yellow-100 text-yellow-600 p-2 rounded-2xl">
                                            <span className="material-symbols-outlined block text-2xl">star</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Favorito</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">5 Estrellas en PWA</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </header>

                {/* The Two Worlds Section */}
                <section className="py-32 bg-slate-50 dark:bg-slate-950 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center text-center mb-20">
                            <h2 className="text-primary font-black tracking-widest uppercase text-sm mb-4">El Poder de la Dualidad</h2>
                            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">Una Plataforma, Dos Experiencias</h3>
                            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
                                Hemos diseñado interfaces específicas para las necesidades críticas de cada usuario.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* Doctor Side */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative group"
                            >
                                <div className="absolute -inset-px bg-gradient-to-b from-primary/20 to-transparent rounded-[2.5rem] z-0"></div>
                                <div className="relative bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 h-full flex flex-col justify-between overflow-hidden">
                                    <div className="z-10 relative">
                                        <div className="bg-primary/10 text-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                                            <span className="material-symbols-outlined text-4xl">stethoscope</span>
                                        </div>
                                        <h4 className="text-3xl font-black mb-4">Para el Pediatra</h4>
                                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                            Optimice su práctica con herramientas de grado médico y cumplimiento legal automático.
                                        </p>
                                        <ul className="space-y-4 mb-10">
                                            {[
                                                { icon: 'monitoring', text: 'Gráficas de Crecimiento OMS Interactivas' },
                                                { icon: 'history_edu', text: 'Expediente Clínico Digital Inteligente' },
                                                { icon: 'assignment_turned_in', text: 'Gestión de Recetas y Certificados' },
                                                { icon: 'support_agent', text: 'Soporte Técnico Especializado' }
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                                                    <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
                                                    {item.text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="relative mt-8 group-hover:scale-[1.05] transition-transform duration-700 flex justify-center">
                                        <img
                                            src="/assets/child-assets.png"
                                            alt="Child Friendly Assets"
                                            className="rounded-3xl max-h-[400px] w-auto drop-shadow-2xl"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Parent Side */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative group"
                            >
                                <div className="absolute -inset-px bg-gradient-to-b from-blue-500/20 to-transparent rounded-[2.5rem] z-0"></div>
                                <div className="relative bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 h-full flex flex-col justify-between overflow-hidden">
                                    <div className="z-10 relative">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                                            <span className="material-symbols-outlined text-4xl">family_restroom</span>
                                        </div>
                                        <h4 className="text-3xl font-black mb-4">Para los Padres</h4>
                                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                            Lleve la salud de sus hijos en su bolsillo con nuestra PWA de última generación.
                                        </p>
                                        <ul className="space-y-4 mb-10">
                                            {[
                                                { icon: 'install_mobile', text: 'App Web (PWA): Instale en segundos' },
                                                { icon: 'shield_moon', text: 'Carnet de Vacunas Digital Siempre a Mano' },
                                                { icon: 'notifications_active', text: 'Recordatorios vía WhatsApp y Email' },
                                                { icon: 'local_hospital', text: 'Telemedicina y Citas en un Toque' }
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                                                    <span className="material-symbols-outlined text-blue-500 text-xl">{item.icon}</span>
                                                    {item.text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="relative mt-auto pt-8">
                                        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                            <div className="flex gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary">child_care</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4 mb-2"></div>
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="h-20 bg-white dark:bg-slate-900 rounded-xl border border-primary/20 flex items-center px-4 gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                                        <span className="material-symbols-outlined">vaccines</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-full mb-1"></div>
                                                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-2/3"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <motion.div
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="absolute -bottom-4 -right-4 bg-primary text-white p-4 rounded-2xl shadow-xl font-bold flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined">add_to_home_screen</span>
                                            Instalar PWA
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* App Experience Tour */}
                <section className="py-32 bg-white dark:bg-slate-900 relative overflow-hidden" id="features">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center text-center mb-20">
                            <h2 className="text-primary font-black tracking-widest uppercase text-sm mb-4">Tour Visual</h2>
                            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">Explora la Experiencia Clínica</h3>
                            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
                                Diseñado para la precisión médica y la calidez familiar. Visualiza cómo transformamos la gestión pediátrica.
                            </p>
                        </div>

                        <BentoGrid className="lg:grid-rows-2">
                            {FEATURES.map((feature, index) => (
                                <BentoCard
                                    key={index}
                                    className={feature.className}
                                    delay={index * 0.1}
                                >
                                    <div className="p-8 h-full flex flex-col">
                                        <div className="mb-6">
                                            <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{feature.title}</h4>
                                            <p className="text-slate-600 dark:text-slate-400 font-medium">{feature.description}</p>
                                        </div>
                                        <div className="mt-auto relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner group">
                                            <img
                                                src={feature.image}
                                                alt={feature.title}
                                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                    </div>
                                </BentoCard>
                            ))}
                        </BentoGrid>
                    </div>
                </section>

                {/* Login Area Integration */}
                <section className="py-24 bg-background-light dark:bg-background-dark relative" id="login">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1 space-y-6">
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">Accede a Tu Clínica Digital</h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400">
                                    Acceso seguro y encriptado a tus registros de pacientes y herramientas clínicas. Ya sea que estés en el hospital o en movimiento, Clínica Pediátrica siempre te acompaña.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                        Almacenamiento compatible con HIPAA
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                        Sincronización en la Nube en Tiempo Real
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                        Acceso PWA Multi-dispositivo
                                    </li>
                                </ul>
                            </div>
                            <div className="w-full max-w-[480px]">
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                                    <LoginForm clinicName="Clínica Pediátrica" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust & Compliance Section */}
                <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">GRÁFICAS <span className="text-primary">OMS</span></span>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Crecimiento Oficial</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">HIPAA <span className="text-primary">SECURE</span></span>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Privacidad de Datos</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">100% <span className="text-primary">CLOUD</span></span>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Sincronización Real</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">PWA <span className="text-primary">MOBILE</span></span>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Sin Descargas</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action Footer */}
                <section className="py-32 bg-primary overflow-hidden relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-primary/20 opacity-50"
                        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                    ></motion.div>
                    <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-tight">
                                Transforme hoy el futuro de su clínica.
                            </h2>
                            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
                                Únase a los cientos de pediatras que ya están ofreciendo una experiencia digital de élite a sus pacientes.
                            </p>
                            <div className="flex flex-wrap justify-center gap-6">
                                <Link href="/register" className="px-12 py-6 bg-white text-primary rounded-[2rem] font-black text-2xl hover:scale-110 transition-transform shadow-2xl flex items-center gap-3">
                                    Obtener Acceso Premium
                                    <span className="material-symbols-outlined">rocket_launch</span>
                                </Link>
                                <button className="px-12 py-6 bg-slate-900/40 backdrop-blur-md border-2 border-white/30 text-white rounded-[2rem] font-black text-2xl hover:bg-white/10 transition-all">
                                    Ver Planes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <footer className="bg-white dark:bg-slate-900 py-12 border-t border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/20 text-primary p-1 rounded-md">
                                    <span className="material-symbols-outlined block text-sm">health_and_safety</span>
                                </div>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">Clínica Pediátrica</span>
                            </div>
                            <div className="flex gap-8 text-sm text-slate-500 dark:text-slate-400">
                                <a className="hover:text-primary transition-colors" href="#">Política de Privacidad</a>
                                <a className="hover:text-primary transition-colors" href="#">Términos de Servicio</a>
                                <a className="hover:text-primary transition-colors" href="#">Política de Cookies</a>
                            </div>
                            <p className="text-sm text-slate-400">© {new Date().getFullYear()} Clínica Pediátrica. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </ReactLenis>
    );
}
