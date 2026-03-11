'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createClinic, toggleClinicStatus } from '@/actions/super-admin';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Power, Edit } from 'lucide-react';

interface Clinic {
    id: string;
    name: string;
    slug: string;
    planName: string;
    status: string;
    createdAt: Date;
    usersCount: number;
}

interface Plan {
    id: string;
    name: string;
}

export default function ClinicListClient({ initialClinics, plans }: { initialClinics: Clinic[], plans: Plan[] }) {
    const [clinics, setClinics] = useState(initialClinics);
    const [isCreating, setIsCreating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [planId, setPlanId] = useState('');
    const { toast } = useToast();

    const handleCreate = async () => {
        setIsCreating(true);
        const res = await createClinic({ name, slug, planId });
        setIsCreating(false);

        if (res.success && res.clinic) {
            toast({ title: 'Clínica creada', description: `La clínica ${res.clinic.name} ha sido registrada con éxito.` });
            setIsDialogOpen(false);
            // Refresh logic - using Next.js you might call router.refresh() or append to state
            setClinics([{
                id: res.clinic.id,
                name: res.clinic.name,
                slug: res.clinic.slug,
                planName: plans.find(p => p.id === res.clinic.planId)?.name || 'N/A',
                status: res.clinic.subscriptionStatus,
                createdAt: res.clinic.createdAt,
                usersCount: 0
            }, ...clinics]);

            // Reset form
            setName('');
            setSlug('');
            setPlanId('');
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        const res = await toggleClinicStatus(id, newStatus);

        if (res.success) {
            setClinics(clinics.map(c => c.id === id ? { ...c, status: newStatus } : c));
            toast({ title: 'Estado actualizado', description: `La clínica ahora está ${newStatus}` });
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        }
    };

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <Input placeholder="Buscar clínica..." className="max-w-xs" />

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="w-4 h-4 mr-2" /> Nueva Clínica</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Registrar Nueva Clínica</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Nombre de la Clínica</Label>
                                    <Input value={name} onChange={e => {
                                        setName(e.target.value);
                                        // Auto-generate slug suggestion
                                        if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                                    }} placeholder="Ej. Centro Pediátrico San Ángel" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subdominio (Slug)</Label>
                                    <div className="flex items-center space-x-2">
                                        <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="san-angel" />
                                        <span className="text-sm text-gray-500">.pediatrica.com</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Plan de Suscripción</Label>
                                    <Select value={planId} onValueChange={setPlanId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione un plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {plans.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full" onClick={handleCreate} disabled={!name || !slug || isCreating}>
                                    {isCreating ? 'Guardando...' : 'Crear Clínica (Tenant)'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="border rounded-md">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 font-medium">Clínica</th>
                                <th className="px-4 py-3 font-medium">Subdominio</th>
                                <th className="px-4 py-3 font-medium">Plan</th>
                                <th className="px-4 py-3 font-medium">Usuarios</th>
                                <th className="px-4 py-3 font-medium">Estado</th>
                                <th className="px-4 py-3 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {clinics.map(clinic => (
                                <tr key={clinic.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{clinic.name}</td>
                                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{clinic.slug}.SaaS.com</td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline">{clinic.planName}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{clinic.usersCount}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={clinic.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} variant="outline">
                                            {clinic.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="icon" title="Editar"><Edit className="w-4 h-4 text-blue-500" /></Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleToggleStatus(clinic.id, clinic.status)}
                                                title={clinic.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
                                            >
                                                <Power className={`w-4 h-4 ${clinic.status === 'ACTIVE' ? 'text-red-500' : 'text-green-500'}`} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {clinics.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        No hay clínicas registradas en la plataforma.
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
