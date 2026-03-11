'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface RBACGuardProps {
    children: ReactNode;
    allowedRoles: string[];
    fallback?: ReactNode;
}

/**
 * Componente de guardia RBAC para protección granular de UI.
 * 
 * Uso:
 * ```tsx
 * <RBACGuard allowedRoles={['ADMIN', 'DOCTOR']}>
 *   <SensitiveComponent />
 * </RBACGuard>
 * ```
 * 
 * Con fallback personalizado:
 * ```tsx
 * <RBACGuard allowedRoles={['ADMIN']} fallback={<p>Sin acceso</p>}>
 *   <AdminOnlyPanel />
 * </RBACGuard>
 * ```
 */
export default function RBACGuard({ children, allowedRoles, fallback = null }: RBACGuardProps) {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return null; // No renderizar nada mientras carga la sesión
    }

    const userRole = (session?.user as any)?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Hook para verificar roles en lógica condicional.
 * 
 * Uso:
 * ```tsx
 * const { hasRole, role } = useRBAC();
 * if (hasRole('ADMIN')) { ... }
 * ```
 */
export function useRBAC() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role as string | undefined;
    const clinicId = (session?.user as any)?.clinicId as string | undefined;

    return {
        role,
        clinicId,
        hasRole: (requiredRole: string | string[]) => {
            if (!role) return false;
            if (Array.isArray(requiredRole)) return requiredRole.includes(role);
            return role === requiredRole;
        },
        isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
        isDoctor: role === 'DOCTOR',
        isPatient: role === 'PATIENT',
        isStaff: role === 'ADMIN' || role === 'DOCTOR' || role === 'RECEPTIONIST',
        isSuperAdmin: role === 'SUPER_ADMIN',
    };
}
