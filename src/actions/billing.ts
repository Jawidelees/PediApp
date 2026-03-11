'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSystemNotification } from './app-notifications';
import { buildFelPayload, certifyWithCertificador } from '@/lib/fel';
import { withTenant, requireRole } from '@/lib/with-tenant';
import prisma from '@/lib/prisma';

/**
 * Certifica una factura existente con el certificador FEL.
 * TENANT-SCOPED + RBAC.
 */
export async function certifyInvoiceAction(invoiceId: string) {
    const { db, user } = await withTenant();
    requireRole(user.role, ['ADMIN', 'RECEPTIONIST']);

    try {
        const invoice = await db.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                appointment: {
                    include: {
                        patient: { include: { user: true } },
                        clinic: true
                    }
                }
            }
        });

        if (!invoice) throw new Error('Factura no encontrada');
        if (invoice.felUuid) throw new Error('La factura ya está certificada');

        const payload = buildFelPayload(
            invoice,
            invoice.appointment.patient,
            invoice.appointment.clinic
        );

        const result = await certifyWithCertificador(payload);

        const updatedInvoice = await db.invoice.update({
            where: { id: invoiceId },
            data: {
                felUuid: result.uuid,
                felSeries: result.serie,
                felNumber: result.numero,
                felJson: result as any,
                updatedAt: new Date()
            }
        });

        revalidatePath('/dashboard/billing');
        return { success: true, invoice: updatedInvoice };

    } catch (error: any) {
        console.error('Error certificando factura:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualiza el estado de pago y registra transacción.
 * TENANT-SCOPED + RBAC.
 */
export async function updatePaymentStatus(data: {
    invoiceId: string;
    status: 'COMPLETED' | 'FAILED' | 'PARTIAL';
    paymentMethod: string;
    paymentRef?: string;
    attachmentUrl?: string;
    amount?: number;
    promisedDate?: string;
}) {
    const { db, user, clinicId } = await withTenant();
    requireRole(user.role, ['ADMIN', 'RECEPTIONIST']);

    try {
        const invoice = await db.$transaction(async (tx: any) => {
            const currentInvoice = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
            if (!currentInvoice) throw new Error('Factura no encontrada');

            const paymentAmount = data.amount || Number(currentInvoice.totalAmount);

            await tx.paymentTransaction.create({
                data: {
                    invoiceId: data.invoiceId,
                    clinicId: clinicId!,
                    amount: paymentAmount,
                    paymentMethod: data.paymentMethod,
                    paymentRef: data.paymentRef,
                    attachmentUrl: data.attachmentUrl,
                    createdBy: user.id
                }
            });

            return await tx.invoice.update({
                where: { id: data.invoiceId },
                data: {
                    status: data.status,
                    paymentMethod: data.paymentMethod,
                    paymentRef: data.paymentRef,
                    attachmentUrl: data.attachmentUrl,
                    promisedDate: data.promisedDate ? new Date(data.promisedDate) : null,
                },
                include: { transactions: true }
            });
        });

        if (data.status === 'COMPLETED' || data.status === 'PARTIAL') {
            await createAdminSystemNotification({
                title: data.status === 'COMPLETED' ? 'Pago Completado' : 'Abono Recibido',
                message: `Se ha registrado un pago de Q${data.amount || invoice.totalAmount} mediante ${data.paymentMethod}.`,
                type: 'SUCCESS',
                link: '/dashboard/billing'
            });
        }

        revalidatePath('/dashboard/billing');
        return {
            success: true,
            invoice: { ...invoice, totalAmount: Number(invoice.totalAmount) }
        };
    } catch (error: any) {
        console.error('Error al actualizar pago:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Emite una factura FEL.
 * TENANT-SCOPED + RBAC.
 */
export async function issueInvoice(data: {
    appointmentId: string;
    totalAmount: number;
    nit?: string;
    nombre?: string;
}) {
    const { db, user, clinicId } = await withTenant();
    requireRole(user.role, ['ADMIN', 'RECEPTIONIST']);

    try {
        const clinic = await prisma.clinic.findUnique({ where: { id: clinicId! } });

        const payload = buildFelPayload(
            { appointmentId: data.appointmentId, totalAmount: data.totalAmount },
            { nit: data.nit || 'CF', user: { name: data.nombre || 'Consumidor Final' } },
            clinic
        );

        const result = await certifyWithCertificador(payload);

        const invoice = await db.invoice.upsert({
            where: { appointmentId: data.appointmentId },
            update: {
                totalAmount: data.totalAmount,
                felUuid: result.uuid,
                felSeries: result.serie,
                felNumber: result.numero,
                felJson: result as any,
                status: 'PENDING',
            },
            create: {
                appointmentId: data.appointmentId,
                totalAmount: data.totalAmount,
                felUuid: result.uuid,
                felSeries: result.serie,
                felNumber: result.numero,
                felJson: result as any,
                status: 'PENDING',
                clinicId: clinicId!,
            }
        });

        revalidatePath('/dashboard/billing');
        return { success: true, invoice: { ...invoice, totalAmount: Number(invoice.totalAmount) } };
    } catch (error: any) {
        console.error('Error al emitir factura:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene todos los servicios activos.
 * TENANT-SCOPED.
 */
export async function getServices() {
    const { db } = await withTenant();

    try {
        const services = await db.service.findMany({ orderBy: { name: 'asc' } });
        return services.map(s => ({ ...s, price: Number(s.price) }));
    } catch (error) {
        console.error('Error obteniendo servicios:', error);
        return [];
    }
}

/**
 * Crea o actualiza un servicio.
 * TENANT-SCOPED + RBAC (solo Admin).
 */
export async function upsertService(data: {
    id?: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    active?: boolean;
}) {
    const { db, user, clinicId } = await withTenant();
    requireRole(user.role, ['ADMIN']);

    try {
        const service = await db.service.upsert({
            where: { id: data.id || 'new' },
            create: {
                name: data.name,
                description: data.description,
                price: data.price,
                duration: data.duration,
                active: data.active ?? true,
                clinicId: clinicId!,
            },
            update: {
                name: data.name,
                description: data.description,
                price: data.price,
                duration: data.duration,
                active: data.active,
            }
        });

        revalidatePath('/dashboard/settings/services');
        return { success: true, service: { ...service, price: Number(service.price) } };
    } catch (error: any) {
        console.error('Error al guardar servicio:', error);
        return { success: false, error: error.message };
    }
}
