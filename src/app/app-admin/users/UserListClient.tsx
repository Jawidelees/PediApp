'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GlobalUser {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    clinicName: string;
    clinicSlug: string;
    createdAt: Date;
    lastLogin?: Date | null;
}

export default function UserListClient({ initialUsers }: { initialUsers: GlobalUser[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = initialUsers.filter(u =>
        (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (u.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    );

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'ADMIN': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'DOCTOR': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'RECEPTIONIST': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'PATIENT': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar por nombre, email o clínica..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="border rounded-md overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 font-medium">Usuario</th>
                                <th className="px-4 py-3 font-medium">Rol</th>
                                <th className="px-4 py-3 font-medium">Clínica (Tenant)</th>
                                <th className="px-4 py-3 font-medium">Subdominio</th>
                                <th className="px-4 py-3 font-medium">Registro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{user.name || 'Sin Nombre'}</div>
                                        <div className="text-xs text-gray-500">{user.email || 'Sin Email'}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-700">
                                        {user.clinicName}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                        {user.clinicSlug !== 'admin' ? `${user.clinicSlug}.SaaS.com` : 'global'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {format(new Date(user.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <ShieldAlert className="w-8 h-8 mb-2 text-gray-400" />
                                            <p>No se encontraron usuarios activos con ese criterio.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
