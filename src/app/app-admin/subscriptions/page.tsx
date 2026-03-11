import { getSubscriptionPlans } from '@/actions/super-admin';
import SubscriptionListClient from './SubscriptionListClient';

export default async function SubscriptionsPage() {
    const plans = await getSubscriptionPlans();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Planes de Suscripción</h2>
                <p className="text-muted-foreground">Configura los paquetes SaaS que ofrecemos a las clínicas pediátricas.</p>
            </div>

            <SubscriptionListClient initialPlans={plans as any} />
        </div>
    );
}
