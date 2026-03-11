

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { createTenantPrisma } from '@/lib/prisma-tenant';

/**
 * Helper principal para todas las server actions.
 * Extrae la sesión del usuario y devuelve un Prisma Client con tenant scope automático.
 * 
 * Uso:
 * ```ts
 * export async function getPatients() {
 *   const { db, user, clinicId } = await withTenant();
 *   return db.patientProfile.findMany(); // Automáticamente filtrado por clinicId
 * }
 * ```
 */
export async function withTenant() {
    const session = await auth();
    const user = session?.user as any;

    if (!user?.id) {
        throw new Error('No autorizado: sesión inválida');
    }

    if (!user.clinicId) {
        // SUPER_ADMIN puede no tener clinicId — usar prisma base
        if (user.role === 'SUPER_ADMIN') {
            return {
                db: prisma,
                user: {
                    id: user.id as string,
                    name: user.name as string,
                    email: user.email as string,
                    role: user.role as string,
                    clinicId: null as string | null,
                },
                clinicId: null as string | null,
            };
        }
        throw new Error('Sin contexto de clínica: el usuario no está asociado a ninguna clínica');
    }

    const tenantPrisma = createTenantPrisma(prisma, {
        clinicId: user.clinicId,
        userId: user.id,
        userRole: user.role,
    });

    return {
        db: tenantPrisma,
        user: {
            id: user.id as string,
            name: user.name as string,
            email: user.email as string,
            role: user.role as string,
            clinicId: user.clinicId as string,
        },
        clinicId: user.clinicId as string,
    };
}

/**
 * Guard de roles para server actions.
 * Lanza error si el usuario no tiene uno de los roles permitidos.
 * 
 * Uso:
 * ```ts
 * const { db, user } = await withTenant();
 * requireRole(user.role, ['ADMIN', 'DOCTOR']);
 * ```
 */
export function requireRole(currentRole: string, allowedRoles: string[]) {
    if (!allowedRoles.includes(currentRole)) {
        throw new Error(`Acceso denegado: se requiere rol ${allowedRoles.join(' o ')}`);
    }
}
