import { getGlobalUsers } from '@/actions/super-admin';
import UserListClient from './UserListClient';

export default async function GlobalUsersPage() {
    const users = await getGlobalUsers();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Directorio Global de Usuarios</h2>
                <p className="text-muted-foreground">Vista global de todos los usuarios registrados en todas las clínicas de la plataforma (Tenants).</p>
            </div>

            <UserListClient initialUsers={users} />
        </div>
    );
}
