import { getClinics, getSubscriptionPlans } from '@/actions/super-admin';
import ClinicListClient from './ClinicListClient';

export default async function ClinicsPage() {
    const clinics = await getClinics();
    const plans = await getSubscriptionPlans();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Gestión de Clínicas (Tenants)</h2>
                <p className="text-muted-foreground">Administra todas las clínicas, sus subdominios y el estado de sus suscripciones.</p>
            </div>

            <ClinicListClient initialClinics={clinics} plans={plans} />
        </div>
    );
}
