'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createSubscriptionPlan, deleteSubscriptionPlan } from '@/actions/super-admin';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function SubscriptionListClient({ initialPlans }: { initialPlans: any[] }) {
    const [plans, setPlans] = useState(initialPlans);
    const [isCreating, setIsCreating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [maxPatients, setMaxPatients] = useState('');
    const [featuresStr, setFeaturesStr] = useState('');
    const { toast } = useToast();

    const handleCreate = async () => {
        setIsCreating(true);
        const parsedPrice = parseFloat(price);
        const parsedMax = maxPatients ? parseInt(maxPatients) : undefined;

        let featuresObj = {};
        try {
            if (featuresStr) {
                // Split by comma and trim to simple array format implicitly saved as JSON
                featuresObj = featuresStr.split(',').map(s => s.trim());
            }
        } catch (e) {
            // fallback empty
        }

        const res = await createSubscriptionPlan({
            name,
            price: isNaN(parsedPrice) ? 0 : parsedPrice,
            maxPatients: isNaN(parsedMax as number) ? undefined : parsedMax,
            features: featuresObj
        });

        setIsCreating(false);

        if (res.success && res.plan) {
            toast({ title: 'Plan creado', description: `El plan ${res.plan.name} está activo.` });
            setIsDialogOpen(false);
            setPlans([...plans, { ...res.plan, _count: { clinics: 0 } }].sort((a, b) => parseFloat(a.price) - parseFloat(b.price)));

            // Reset form
            setName('');
            setPrice('');
            setMaxPatients('');
            setFeaturesStr('');
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Seguro que deseas eliminar el plan ${name}?`)) return;

        const res = await deleteSubscriptionPlan(id);
        if (res.success) {
            setPlans(plans.filter(p => p.id !== id));
            toast({ title: 'Plan eliminado' });
        } else {
            toast({ title: 'No se pudo eliminar', description: res.error, variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Existen {plans.length} planes configurados.</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" /> Nuevo Plan SaaS</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Nivel de Suscripción</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Nombre del Plan</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Pro Pediatría" />
                            </div>
                            <div className="space-y-2">
                                <Label>Precio Mensual (Qtz/$)</Label>
                                <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="299.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>Límite de Pacientes (Opcional)</Label>
                                <Input type="number" value={maxPatients} onChange={e => setMaxPatients(e.target.value)} placeholder="Dejar en blanco para ilimitado" />
                            </div>
                            <div className="space-y-2">
                                <Label>Características (Separadas por comas)</Label>
                                <Input value={featuresStr} onChange={e => setFeaturesStr(e.target.value)} placeholder="WhatsApp bot, Agenda Web, Analíticas..." />
                            </div>
                            <Button className="w-full" onClick={handleCreate} disabled={!name || !price || isCreating}>
                                {isCreating ? 'Guardando...' : 'Crear Plan'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map(plan => (
                    <Card key={plan.id} className="relative overflow-hidden flex flex-col pt-4 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-xl text-blue-900">{plan.name}</CardTitle>
                            <CardDescription className="text-3xl font-bold text-gray-900 mt-2">
                                {Number(plan.price).toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}<span className="text-sm font-normal text-gray-500">/mo</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between mt-4">
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                                    <span>{plan.maxPatients ? `Límite: ${plan.maxPatients.toLocaleString()} pacientes` : 'Pacientes ilimitados'}</span>
                                </li>
                                {plan.features && Array.isArray(plan.features) && plan.features.map((feat: string, i: number) => (
                                    <li key={i} className="flex items-center text-sm text-gray-600">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto pt-4 border-t flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {plan._count?.clinics || 0} Clínicas suscritas
                                </span>
                                {(plan._count?.clinics || 0) === 0 && (
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id, plan.name)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
