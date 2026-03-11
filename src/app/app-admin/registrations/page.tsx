import { getPendingRegistrations } from '@/actions/super-admin';
import RegistrationListClient from './RegistrationListClient';

export default async function RegistrationsPage() {
    const registrations = await getPendingRegistrations();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Solicitudes de Clínicas (Onboarding)</h2>
                <p className="text-muted-foreground">Revisa y aprueba solicitudes de nuevas clínicas pediátricas en el Tenant B2B.</p>
            </div>

            <RegistrationListClient initialRegistrations={registrations} />
        </div>
    );
}
