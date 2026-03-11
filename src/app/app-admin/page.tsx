import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Building, Users, Activity } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function AppAdminPage() {
    // Collect some basic global platform stats
    const totalClinics = await prisma.clinic.count({ where: { deletedAt: null } });
    const totalUsers = await prisma.user.count({ where: { deletedAt: null } });
    const totalSubscriptions = await prisma.subscriptionPlan.count();

    // In a real scenario you would have more complex metrics here

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard General SaaS</h2>
                <p className="text-muted-foreground mt-2">Visión global de todas las clínicas pediátricas y suscripciones en la plataforma.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white shadow-sm border border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total de Clínicas Activas</CardTitle>
                        <Building className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClinics}</div>
                        <p className="text-xs text-muted-foreground mt-1">Suscritos a la plataforma</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Usuarios Totales</CardTitle>
                        <Users className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">A través de todos los tenants</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Planes Activos</CardTitle>
                        <Database className="w-4 h-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSubscriptions}</div>
                        <p className="text-xs text-muted-foreground mt-1">Niveles de SaaS configurados</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Estado del Sistema</CardTitle>
                        <Activity className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">Saludable</div>
                        <p className="text-xs text-muted-foreground mt-1">Tenant isolation activo</p>
                    </CardContent>
                </Card>
            </div>

            {/* Placeholder for future charts or deeper analytics */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1 shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle>Clínicas Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">Las altas recientes de clínicas aparecerán aquí.</p>
                    </CardContent>
                </Card>
                <Card className="col-span-1 shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle>Actividad Global</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">Métricas de volumen de la API y facturación aquí.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
