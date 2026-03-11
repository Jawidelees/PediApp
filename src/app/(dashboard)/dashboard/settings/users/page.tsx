'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Loader2, Search, ArrowLeft, Eye, EyeOff, Stethoscope, AtSign, Mail, User, Shield, BadgeCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface StaffUser {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
    role: string;
    createdAt: string;
    doctorProfile?: {
        specialty: string | null;
        license: string | null;
    } | null;
}

export default function UsersSettingsPage() {
    const [staff, setStaff] = useState<StaffUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<'RECEPTIONIST' | 'DOCTOR'>('RECEPTIONIST');
    const [specialty, setSpecialty] = useState('Pediatría General');
    const [license, setLicense] = useState('');
    const [loginMethod, setLoginMethod] = useState<'email' | 'username'>('email');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                setIsLoading(true);
                const res = await fetch('/api/staff');
                if (res.ok) {
                    const data = await res.json();
                    setStaff(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStaff();
    }, []);

    // Auto-suggest username from first/last name
    useEffect(() => {
        if (loginMethod === 'username' && firstName && lastName && !username) {
            const suggestion = `${firstName.toLowerCase().replace(/\s/g, '')}.${lastName.toLowerCase().replace(/\s/g, '')}`;
            setUsername(suggestion.replace(/[^a-zA-Z0-9._]/g, ''));
        }
    }, [firstName, lastName, loginMethod, username]);

    const fetchStaff = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/staff');
            if (res.ok) {
                const data = await res.json();
                setStaff(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const validateField = (field: string, value: string) => {
        const errors = { ...fieldErrors };

        switch (field) {
            case 'firstName':
                if (!value.trim()) errors.firstName = 'El nombre es obligatorio';
                else if (value.trim().length < 2) errors.firstName = 'Mínimo 2 caracteres';
                else delete errors.firstName;
                break;
            case 'lastName':
                if (!value.trim()) errors.lastName = 'El apellido es obligatorio';
                else if (value.trim().length < 2) errors.lastName = 'Mínimo 2 caracteres';
                else delete errors.lastName;
                break;
            case 'email':
                if (loginMethod === 'email') {
                    if (!value.trim()) errors.email = 'El correo es obligatorio';
                    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Formato de correo inválido';
                    else delete errors.email;
                } else {
                    delete errors.email;
                }
                break;
            case 'username':
                if (loginMethod === 'username') {
                    if (!value.trim()) errors.username = 'El usuario es obligatorio';
                    else if (!/^[a-zA-Z0-9._]{3,30}$/.test(value)) errors.username = 'Solo letras, números, puntos y guiones bajos (3-30 car.)';
                    else delete errors.username;
                } else {
                    delete errors.username;
                }
                break;
            case 'password':
                if (!value) errors.password = 'La contraseña es obligatoria';
                else if (value.length < 6) errors.password = 'Mínimo 6 caracteres';
                else delete errors.password;
                break;
        }

        setFieldErrors(errors);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Final validation
        const errors: Record<string, string> = {};
        if (!firstName.trim()) errors.firstName = 'El nombre es obligatorio';
        if (!lastName.trim()) errors.lastName = 'El apellido es obligatorio';
        if (loginMethod === 'email' && !email.trim()) errors.email = 'El correo es obligatorio';
        if (loginMethod === 'username' && !username.trim()) errors.username = 'El usuario es obligatorio';
        if (!password || password.length < 6) errors.password = 'Mínimo 6 caracteres';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            setIsLoading(true);
            const res = await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: loginMethod === 'email' ? email.trim() : (email.trim() || undefined),
                    username: loginMethod === 'username' ? username.trim() : (username.trim() || undefined),
                    password,
                    role,
                    specialty: role === 'DOCTOR' ? specialty : undefined,
                    license: role === 'DOCTOR' ? license : undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al crear usuario');

            setSuccess(`✅ ${data.name} registrado como ${role === 'DOCTOR' ? 'Pediatra' : 'Recepcionista'}. ${loginMethod === 'email' ? `Correo: ${data.email}` : `Usuario: ${data.username}`}`);
            resetForm();
            setIsAdding(false);
            fetchStaff();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setUsername('');
        setPassword('');
        setRole('RECEPTIONIST');
        setSpecialty('Pediatría General');
        setLicense('');
        setLoginMethod('email');
        setFieldErrors({});
        setShowPassword(false);
    };

    const filteredStaff = staff.filter(u =>
        (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.username || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const roleLabels: Record<string, string> = {
        ADMIN: 'Administrador',
        DOCTOR: 'Pediatra',
        RECEPTIONIST: 'Recepcionista',
    };

    const roleColors: Record<string, string> = {
        ADMIN: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
        DOCTOR: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
        RECEPTIONIST: 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border border-violet-200 dark:border-violet-800',
    };

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in max-w-5xl">
            <div className="flex items-center gap-4 mb-4">
                <Link
                    href="/dashboard/settings"
                    className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios y Staff</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gestión de doctores y recepcionistas
                    </p>
                </div>
            </div>

            {/* Banners */}
            {error && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}
            {success && (
                <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    {success}
                </div>
            )}

            {!isAdding ? (
                <>
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, correo o usuario..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-72 pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => { setIsAdding(true); setError(''); setSuccess(''); }}
                            className="btn-primary w-full sm:w-auto"
                        >
                            <UserPlus className="w-4 h-4" />
                            Agregar Colaborador
                        </button>
                    </div>

                    {/* Staff Table */}
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-200 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4">Colaborador</th>
                                        <th className="px-6 py-4">Acceso</th>
                                        <th className="px-6 py-4">Rol</th>
                                        <th className="px-6 py-4">Detalle</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-gray-700 dark:text-gray-300">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" />
                                            </td>
                                        </tr>
                                    ) : filteredStaff.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <Users className="w-10 h-10 mx-auto mb-3 text-gray-200 dark:text-zinc-700" />
                                                <p className="text-sm text-gray-400">No hay personal registrado.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStaff.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-black text-xs uppercase">
                                                        {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U'}
                                                    </div>
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{user.name || 'Sin nombre'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        {user.email && (
                                                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                                <Mail className="w-3 h-3" />{user.email}
                                                            </span>
                                                        )}
                                                        {user.username && (
                                                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                                <AtSign className="w-3 h-3" />{user.username}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', roleColors[user.role] || '')}>
                                                        {roleLabels[user.role] || user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-400">
                                                    {user.doctorProfile ? (
                                                        <span className="flex items-center gap-1">
                                                            <Stethoscope className="w-3 h-3" />
                                                            {user.doctorProfile.specialty || 'General'}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                        Activo
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nuevo Colaborador</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Registra un nuevo miembro del equipo de Clínica Pediátrica.</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                            {/* --- Identity Section --- */}
                            <fieldset>
                                <legend className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-4 flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" />
                                    Datos Personales
                                </legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        label="Nombres"
                                        value={firstName}
                                        onChange={(v) => { setFirstName(v); validateField('firstName', v); }}
                                        placeholder="Ej: Salvador"
                                        error={fieldErrors.firstName}
                                        required
                                    />
                                    <FormField
                                        label="Apellidos"
                                        value={lastName}
                                        onChange={(v) => { setLastName(v); validateField('lastName', v); }}
                                        placeholder="Ej: López Morales"
                                        error={fieldErrors.lastName}
                                        required
                                    />
                                </div>
                            </fieldset>

                            {/* --- Role Section --- */}
                            <fieldset>
                                <legend className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-4 flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5" />
                                    Rol en la Clínica
                                </legend>
                                <div className="grid grid-cols-2 gap-3">
                                    <RoleCard
                                        label="Recepcionista"
                                        description="Gestiona citas, pacientes e inventario"
                                        icon={<Users className="w-5 h-5" />}
                                        selected={role === 'RECEPTIONIST'}
                                        onClick={() => setRole('RECEPTIONIST')}
                                    />
                                    <RoleCard
                                        label="Pediatra"
                                        description="Atiende pacientes, historial clínico"
                                        icon={<Stethoscope className="w-5 h-5" />}
                                        selected={role === 'DOCTOR'}
                                        onClick={() => setRole('DOCTOR')}
                                    />
                                </div>

                                {/* Doctor-specific fields */}
                                {role === 'DOCTOR' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                        <FormField
                                            label="Especialidad"
                                            value={specialty}
                                            onChange={setSpecialty}
                                            placeholder="Ej: Ortodoncia"
                                        />
                                        <FormField
                                            label="No. de Colegiado"
                                            value={license}
                                            onChange={setLicense}
                                            placeholder="Opcional"
                                        />
                                    </div>
                                )}
                            </fieldset>

                            {/* --- Access Section --- */}
                            <fieldset>
                                <legend className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-4 flex items-center gap-2">
                                    <BadgeCheck className="w-3.5 h-3.5" />
                                    Credenciales de Acceso
                                </legend>

                                {/* Login method toggle */}
                                <div className="flex p-1 bg-gray-100 dark:bg-zinc-900 rounded-2xl border border-gray-200/50 dark:border-zinc-800/50 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => { setLoginMethod('email'); setFieldErrors(prev => { const f = { ...prev }; delete f.username; return f; }); }}
                                        className={cn(
                                            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                                            loginMethod === 'email'
                                                ? 'bg-white dark:bg-zinc-950 text-brand-600 shadow-sm'
                                                : 'text-gray-400 hover:text-gray-600'
                                        )}
                                    >
                                        <Mail className="w-3.5 h-3.5" />
                                        Con Correo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setLoginMethod('username'); setFieldErrors(prev => { const f = { ...prev }; delete f.email; return f; }); }}
                                        className={cn(
                                            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                                            loginMethod === 'username'
                                                ? 'bg-white dark:bg-zinc-950 text-brand-600 shadow-sm'
                                                : 'text-gray-400 hover:text-gray-600'
                                        )}
                                    >
                                        <AtSign className="w-3.5 h-3.5" />
                                        Con Usuario
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {loginMethod === 'email' ? (
                                        <FormField
                                            label="Correo Electrónico"
                                            type="email"
                                            value={email}
                                            onChange={(v) => { setEmail(v); validateField('email', v); }}
                                            placeholder="correo@ejemplo.com"
                                            error={fieldErrors.email}
                                            required
                                            icon={<Mail className="w-4 h-4" />}
                                        />
                                    ) : (
                                        <FormField
                                            label="Nombre de Usuario"
                                            value={username}
                                            onChange={(v) => { setUsername(v.toLowerCase()); validateField('username', v); }}
                                            placeholder="salvador.lopez"
                                            error={fieldErrors.username}
                                            required
                                            hint="Se usará para iniciar sesión"
                                            icon={<AtSign className="w-4 h-4" />}
                                        />
                                    )}

                                    {/* Optional: show both fields */}
                                    {loginMethod === 'email' && (
                                        <FormField
                                            label="Usuario (opcional)"
                                            value={username}
                                            onChange={(v) => setUsername(v.toLowerCase())}
                                            placeholder="Alternativa para login"
                                            hint="Si se proporciona, también podrá iniciar sesión con este usuario"
                                            icon={<AtSign className="w-4 h-4" />}
                                        />
                                    )}
                                    {loginMethod === 'username' && (
                                        <FormField
                                            label="Correo (opcional)"
                                            type="email"
                                            value={email}
                                            onChange={setEmail}
                                            placeholder="Para notificaciones futuras"
                                            hint="No es necesario para iniciar sesión"
                                            icon={<Mail className="w-4 h-4" />}
                                        />
                                    )}

                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Contraseña Temporal <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={password}
                                                onChange={(e) => { setPassword(e.target.value); validateField('password', e.target.value); }}
                                                placeholder="Mínimo 6 caracteres"
                                                className={cn(
                                                    'w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all pr-12',
                                                    fieldErrors.password ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-zinc-800'
                                                )}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {fieldErrors.password && (
                                            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </fieldset>

                            {/* Preview Card */}
                            {(firstName || lastName) && (
                                <div className="p-4 rounded-2xl bg-brand-50/30 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/20">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-2">Vista previa de credenciales</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 font-black text-sm">
                                            {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{firstName} {lastName}</p>
                                            <p className="text-xs text-gray-500">
                                                {loginMethod === 'email' ? (email || 'correo@ejemplo.com') : `@${username || 'usuario'}`}
                                                {' · '}
                                                <span className={cn('font-bold', role === 'DOCTOR' ? 'text-blue-600' : 'text-violet-600')}>
                                                    {role === 'DOCTOR' ? 'Pediatra' : 'Recepcionista'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => { setIsAdding(false); resetForm(); }}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar Colaborador'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Reusable sub-components ---

function FormField({
    label,
    value,
    onChange,
    placeholder,
    error,
    hint,
    required,
    type = 'text',
    icon,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    type?: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        'w-full py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all',
                        icon ? 'pl-10 pr-4' : 'px-4',
                        error ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-zinc-800'
                    )}
                />
            </div>
            {error && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {error}
                </p>
            )}
            {hint && !error && (
                <p className="text-xs text-gray-400 ml-1">{hint}</p>
            )}
        </div>
    );
}

function RoleCard({
    label,
    description,
    icon,
    selected,
    onClick,
}: {
    label: string;
    description: string;
    icon: React.ReactNode;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'relative p-4 rounded-2xl border-2 text-left transition-all group',
                selected
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 shadow-sm'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950'
            )}
        >
            <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors',
                selected
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 dark:bg-zinc-900 text-gray-400 group-hover:text-gray-600'
            )}>
                {icon}
            </div>
            <p className={cn(
                'font-bold text-sm',
                selected ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'
            )}>
                {label}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
            {selected && (
                <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-500" />
                </div>
            )}
        </button>
    );
}
