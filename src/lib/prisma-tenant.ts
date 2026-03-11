import { PrismaClient } from '@prisma/client';

/**
 * Modelos que requieren tenant scoping automático.
 * Todas las queries a estos modelos se filtrarán por clinicId.
 */
const TENANT_MODELS = [
    'user',
    'doctorProfile',
    'patientProfile',
    'service',
    'appointment',
    'inventoryItem',
    'inventoryUsage',
    'invoice',
    'paymentTransaction',
    'medicalRecord',
    'treatmentPlan',
    'growthRecord',
    'vaccinationRecord',
    'appNotification',
    'securityAuditLog',
] as const;

/**
 * Modelos que soportan soft delete (tienen campo deletedAt).
 */
const SOFT_DELETE_MODELS = [
    'clinic',
    'user',
    'doctorProfile',
    'patientProfile',
    'service',
    'appointment',
    'inventoryItem',
    'invoice',
    'medicalRecord',
    'treatmentPlan',
    'growthRecord',
    'vaccinationRecord',
] as const;

/**
 * Modelos cuyas mutaciones deben registrarse automáticamente en audit log.
 */
const AUDITED_MODELS = [
    'patientProfile',
    'medicalRecord',
    'appointment',
    'vaccinationRecord',
    'growthRecord',
    'treatmentPlan',
    'invoice',
] as const;

type TenantModel = typeof TENANT_MODELS[number];
type SoftDeleteModel = typeof SOFT_DELETE_MODELS[number];
type AuditedModel = typeof AUDITED_MODELS[number];

function isTenantModel(model: string): model is TenantModel {
    return TENANT_MODELS.includes(model.charAt(0).toLowerCase() + model.slice(1) as TenantModel);
}

function isSoftDeleteModel(model: string): model is SoftDeleteModel {
    return SOFT_DELETE_MODELS.includes(model.charAt(0).toLowerCase() + model.slice(1) as SoftDeleteModel);
}

function isAuditedModel(model: string): model is AuditedModel {
    return AUDITED_MODELS.includes(model.charAt(0).toLowerCase() + model.slice(1) as AuditedModel);
}

interface TenantContext {
    clinicId: string;
    userId: string;
    userRole: string;
}

/**
 * Crea un Prisma Client con middleware de tenant automático.
 * 
 * - Inyecta `clinicId` en WHERE para todas las lecturas
 * - Inyecta `deletedAt: null` para excluir registros eliminados
 * - Convierte `delete` en soft delete (update con deletedAt)
 * - Registra mutaciones críticas en SecurityAuditLog
 */
export function createTenantPrisma(basePrisma: PrismaClient, context: TenantContext): PrismaClient {
    const { clinicId, userId } = context;

    // Usamos $extends para crear una instancia derivada con middleware
    return basePrisma.$extends({
        query: {
            $allModels: {
                // === READ OPERATIONS ===
                async findMany({ model, args, query }) {
                    const modelName = model as string;

                    // Tenant scoping
                    if (isTenantModel(modelName)) {
                        args.where = { ...args.where, clinicId } as any;
                    }

                    // Soft delete filter
                    if (isSoftDeleteModel(modelName)) {
                        args.where = { ...args.where, deletedAt: null } as any;
                    }

                    return query(args);
                },

                async findFirst({ model, args, query }) {
                    const modelName = model as string;

                    if (isTenantModel(modelName)) {
                        args.where = { ...args.where, clinicId } as any;
                    }
                    if (isSoftDeleteModel(modelName)) {
                        args.where = { ...args.where, deletedAt: null } as any;
                    }

                    return query(args);
                },

                async findUnique({ model, args, query }) {
                    const modelName = model as string;
                    const result = await query(args);

                    // Post-query validation: verify the result belongs to the tenant
                    if (result && isTenantModel(modelName)) {
                        if ((result as any).clinicId && (result as any).clinicId !== clinicId) {
                            console.error(`[TENANT VIOLATION] User ${userId} tried to access ${modelName} from another clinic`);
                            return null; // Block cross-tenant access
                        }
                    }

                    // Block soft-deleted records
                    if (result && isSoftDeleteModel(modelName) && (result as any).deletedAt !== null) {
                        return null;
                    }

                    return result;
                },

                async count({ model, args, query }) {
                    const modelName = model as string;

                    if (isTenantModel(modelName)) {
                        args.where = { ...args.where, clinicId } as any;
                    }
                    if (isSoftDeleteModel(modelName)) {
                        args.where = { ...args.where, deletedAt: null } as any;
                    }

                    return query(args);
                },

                async aggregate({ model, args, query }) {
                    const modelName = model as string;

                    if (isTenantModel(modelName)) {
                        args.where = { ...args.where, clinicId } as any;
                    }
                    if (isSoftDeleteModel(modelName)) {
                        args.where = { ...args.where, deletedAt: null } as any;
                    }

                    return query(args);
                },

                // === WRITE OPERATIONS ===
                async create({ model, args, query }) {
                    const modelName = model as string;

                    // Auto-inject clinicId on create
                    if (isTenantModel(modelName)) {
                        args.data = { ...args.data, clinicId } as any;
                    }

                    const result = await query(args);

                    // Auto audit log for critical models
                    if (isAuditedModel(modelName)) {
                        await logAudit(basePrisma, {
                            userId,
                            clinicId,
                            action: `CREATE_${modelName.replace(/([A-Z])/g, '_$1').toUpperCase()}`,
                            resource: modelName,
                            resourceId: (result as any)?.id,
                            metadata: { after: sanitizeForLog(result) },
                        });
                    }

                    return result;
                },

                async createMany({ model, args, query }) {
                    const modelName = model as string;

                    if (isTenantModel(modelName)) {
                        if (Array.isArray(args.data)) {
                            args.data = args.data.map((item: any) => ({ ...item, clinicId }));
                        } else {
                            args.data = { ...args.data, clinicId };
                        }
                    }

                    return query(args);
                },

                async update({ model, args, query }) {
                    const modelName = model as string;

                    const result = await query(args);

                    // Post-query validation: verify the record belongs to this tenant
                    if (result && isTenantModel(modelName)) {
                        if ((result as any).clinicId && (result as any).clinicId !== clinicId) {
                            console.error(`[TENANT VIOLATION] User ${userId} tried to update ${modelName} from another clinic`);
                            throw new Error('Acceso denegado: registro no pertenece a esta clínica.');
                        }
                    }

                    if (isAuditedModel(modelName)) {
                        await logAudit(basePrisma, {
                            userId,
                            clinicId,
                            action: `UPDATE_${modelName.replace(/([A-Z])/g, '_$1').toUpperCase()}`,
                            resource: modelName,
                            resourceId: (result as any)?.id,
                            metadata: { changes: sanitizeForLog(args.data) },
                        });
                    }

                    return result;
                },

                async updateMany({ model, args, query }) {
                    const modelName = model as string;

                    if (isTenantModel(modelName)) {
                        args.where = { ...args.where, clinicId };
                    }

                    return query(args);
                },

                // === SOFT DELETE ===
                async delete({ model, args, query }) {
                    const modelName = model as string;

                    if (isSoftDeleteModel(modelName)) {
                        // Convert hard delete to soft delete
                        const result = await (basePrisma as any)[modelName].update({
                            where: args.where,
                            data: { deletedAt: new Date() },
                        });

                        if (isAuditedModel(modelName)) {
                            await logAudit(basePrisma, {
                                userId,
                                clinicId,
                                action: `SOFT_DELETE_${modelName.replace(/([A-Z])/g, '_$1').toUpperCase()}`,
                                resource: modelName,
                                resourceId: (result as any)?.id,
                            });
                        }

                        return result;
                    }

                    return query(args);
                },

                async deleteMany({ model, args, query }) {
                    const modelName = model as string;

                    if (isSoftDeleteModel(modelName)) {
                        // Convert hard deleteMany to soft deleteMany
                        if (isTenantModel(modelName)) {
                            args.where = { ...args.where, clinicId };
                        }
                        return (basePrisma as any)[modelName].updateMany({
                            where: args.where,
                            data: { deletedAt: new Date() },
                        });
                    }

                    if (isTenantModel(modelName)) {
                        args.where = { ...args.where, clinicId };
                    }

                    return query(args);
                },
            },
        },
    }) as unknown as PrismaClient;
}

/**
 * Registra una acción en el audit log.
 * Usa el Prisma base (sin middleware) para evitar recursión infinita.
 */
async function logAudit(
    prisma: PrismaClient,
    data: {
        userId: string;
        clinicId: string;
        action: string;
        resource: string;
        resourceId?: string;
        metadata?: any;
    }
) {
    try {
        await prisma.securityAuditLog.create({
            data: {
                userId: data.userId,
                clinicId: data.clinicId,
                action: data.action,
                resource: data.resource,
                resourceId: data.resourceId || undefined,
                metadata: data.metadata || undefined,
            },
        });
    } catch (error) {
        // Audit logging should never crash the main flow
        console.error('[AUDIT LOG ERROR]', error);
    }
}

/**
 * Sanitiza objetos para el log, removiendo datos sensibles.
 */
function sanitizeForLog(data: any): any {
    if (!data) return null;
    const sanitized = { ...data };

    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.p256dh;
    delete sanitized.auth;

    // Truncate large text fields
    for (const key of Object.keys(sanitized)) {
        if (typeof sanitized[key] === 'string' && sanitized[key].length > 500) {
            sanitized[key] = sanitized[key].substring(0, 500) + '...[TRUNCATED]';
        }
    }

    return sanitized;
}
