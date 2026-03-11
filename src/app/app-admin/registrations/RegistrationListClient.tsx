'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { approveRegistration, rejectRegistration } from '@/actions/super-admin';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, Building, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Registration {
    id: string;
    clinicName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string | null;
    status: string;
    createdAt: Date;
    notes: string | null;
}

export default function RegistrationListClient({ initialRegistrations }: { initialRegistrations: Registration[] }) {
    const [registrations, setRegistrations] = useState(initialRegistrations);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleApprove = async (id: string, name: string) => {
        setLoadingId(id);
        const res = await approveRegistration(id);
        setLoadingId(null);

        if (res.success) {
            toast({ title: 'Clínica Aprobada', description: res.message });
            setRegistrations(registrations.filter(r => r.id !== id));
        } else {
            toast({ title: 'Error al Aprobar', description: res.error, variant: 'destructive' });
        }
    };

    const handleReject = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de RECHAZAR la solicitud de ${name}?`)) return;

        setLoadingId(id);
        const res = await rejectRegistration(id);
        setLoadingId(null);

        if (res.success) {
            toast({ title: 'Solicitud Rechazada' });
            setRegistrations(registrations.filter(r => r.id !== id));
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        }
    };

    if (registrations.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <Building className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No hay solicitudes pendientes</h3>
                    <p className="text-gray-500 mt-1 max-w-sm">
                        Todas las solicitudes de clínicas han sido procesadas. Las nuevas solicitudes aparecerán aquí para tu revisión.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-6">
            {registrations.map(reg => (
                <Card key={reg.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <Building className="w-5 h-5 mr-2 text-blue-500" />
                                    {reg.clinicName}
                                </h3>
                                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                                    PENDIENTE
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                        <span className="font-medium text-gray-900 mr-2">Solicitante:</span>
                                        {reg.contactName} ({reg.contactEmail})
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                        <span className="font-medium text-gray-900 mr-2">Teléfono:</span>
                                        {reg.contactPhone || 'No proveído'}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        <span className="font-medium text-gray-900 mr-2">Fecha Solicitud:</span>
                                        {format(new Date(reg.createdAt), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                                    </div>
                                </div>

                                {reg.notes && (
                                    <div className="bg-gray-50 p-3 rounded-md border text-sm text-gray-600 h-full">
                                        <span className="font-semibold text-gray-900 block mb-1">Notas del solicitante:</span>
                                        <p className="whitespace-pre-wrap">{reg.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 border-t md:border-t-0 md:border-l p-6 flex flex-row md:flex-col justify-center gap-3 w-full md:w-48 shrink-0">
                            <Button
                                onClick={() => handleApprove(reg.id, reg.clinicName)}
                                disabled={loadingId !== null}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                {loadingId === reg.id ? 'Procesando...' : 'Aprobar'}
                            </Button>
                            <Button
                                onClick={() => handleReject(reg.id, reg.clinicName)}
                                disabled={loadingId !== null}
                                variant="outline"
                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Rechazar
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
