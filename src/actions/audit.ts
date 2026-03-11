'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { headers } from 'next/headers';

interface AuditLogData {
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, any>;
}

/**
 * Registra una acción sensible en el SecurityAuditLog.
 * Debe ser llamado de manera asíncrona sin bloquear la UI principal.
 * 
 * Para mutaciones automáticas, el Prisma Tenant Middleware ya registra audit logs.
 * Esta función es para registros manuales (ej: accesos a datos sensibles).
 */
export async function logMedicalAccess(data: AuditLogData) {
    try {
        const session = await auth();
        const user = session?.user as any;

        if (!user?.id) return;

        const headersList = await headers();
        const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        await prisma.securityAuditLog.create({
            data: {
                userId: user.id,
                clinicId: user.clinicId,
                action: data.action,
                resource: data.resource,
                resourceId: data.resourceId,
                metadata: data.metadata || undefined,
                ipAddress: ipAddress,
                userAgent: userAgent,
            }
        });
    } catch (error) {
        // Audit logging should NOT crash the main application flow
        console.error('Failed to write Security Audit Log:', error);
    }
}

/**
 * Obtiene los audit logs de la clínica actual (solo ADMIN).
 */
export async function getAuditLogs(options?: {
    limit?: number;
    offset?: number;
    action?: string;
    userId?: string;
}) {
    const session = await auth();
    const user = session?.user as any;

    if (!user?.id || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Acceso denegado: solo administradores pueden ver audit logs');
    }

    try {
        const where: any = {};

        // Tenant scoping (SUPER_ADMIN ve todo)
        if (user.role !== 'SUPER_ADMIN' && user.clinicId) {
            where.clinicId = user.clinicId;
        }

        if (options?.action) where.action = { contains: options.action };
        if (options?.userId) where.userId = options.userId;

        const [logs, total] = await Promise.all([
            prisma.securityAuditLog.findMany({
                where,
                include: {
                    user: {
                        select: { name: true, email: true, role: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: options?.limit || 50,
                skip: options?.offset || 0,
            }),
            prisma.securityAuditLog.count({ where }),
        ]);

        return { logs, total };
    } catch (error) {
        console.error('Error obteniendo audit logs:', error);
        return { logs: [], total: 0 };
    }
}
