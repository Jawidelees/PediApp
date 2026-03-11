'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { withTenant, requireRole } from '@/lib/with-tenant';

/**
 * Crea o actualiza una nota médica para una cita.
 * TENANT-SCOPED + RBAC (solo doctores/admin).
 */
export async function saveMedicalRecord(data: {
    appointmentId: string;
    patientId: string;
    diagnosis: string;
    notes?: string;
    prescription?: string;
    aiAdvice?: string;
    painMap?: any;
    serviceId?: string;
    medications?: Array<{ id: string, name: string, quantity: number, price: number }>;
}) {
    const { db, user, clinicId } = await withTenant();
    requireRole(user.role, ['ADMIN', 'DOCTOR']);

    try {
        const result = await db.$transaction(async (tx: any) => {
            const record = await tx.medicalRecord.upsert({
                where: { appointmentId: data.appointmentId },
                update: {
                    diagnosis: data.diagnosis,
                    notes: data.notes,
                    prescription: data.prescription,
                    aiAdvice: data.aiAdvice,
                    painMap: data.painMap,
                },
                create: {
                    appointmentId: data.appointmentId,
                    patientId: data.patientId,
                    clinicId: clinicId!,
                    diagnosis: data.diagnosis,
                    notes: data.notes,
                    prescription: data.prescription,
                    aiAdvice: data.aiAdvice,
                    painMap: data.painMap,
                },
            });

            if (data.serviceId) {
                await tx.appointment.update({
                    where: { id: data.appointmentId },
                    data: { serviceId: data.serviceId }
                });
            }

            const appointment = await tx.appointment.findUnique({
                where: { id: data.appointmentId },
                include: { service: true }
            });

            if (!appointment) throw new Error("Cita no encontrada");

            await tx.appointment.update({
                where: { id: data.appointmentId },
                data: { status: 'COMPLETED' },
            });

            const medTotal = data.medications?.reduce((sum: number, med: any) => sum + (med.price * med.quantity), 0) || 0;
            const totalAmount = Number(appointment.service.price) + medTotal;

            await tx.invoice.upsert({
                where: { appointmentId: data.appointmentId },
                update: { totalAmount, status: 'PENDING' },
                create: {
                    appointmentId: data.appointmentId,
                    clinicId: clinicId!,
                    totalAmount,
                    status: 'PENDING',
                }
            });

            if (data.medications && data.medications.length > 0) {
                for (const med of data.medications) {
                    const invItem = await tx.inventoryItem.findUnique({ where: { id: med.id } });
                    if (!invItem) continue;

                    let { openPackageUnits, stock, unitsPerPackage } = invItem as any;
                    let req = med.quantity;
                    let updOpen = openPackageUnits;
                    let updStock = stock;

                    if (updOpen >= req) {
                        updOpen -= req;
                    } else {
                        while (req > updOpen) {
                            if (updStock <= 0) break;
                            updStock -= 1;
                            updOpen += unitsPerPackage;
                        }
                        updOpen -= req;
                    }
                    if (updOpen < 0) updOpen = 0;

                    await tx.inventoryItem.update({
                        where: { id: med.id },
                        data: { stock: updStock, openPackageUnits: updOpen }
                    });

                    await tx.inventoryUsage.create({
                        data: {
                            appointmentId: data.appointmentId,
                            inventoryId: med.id,
                            clinicId: clinicId!,
                            quantity: med.quantity,
                            billed: true
                        }
                    });
                }
            }

            return { record, appointment };
        });

        revalidatePath(`/dashboard/patients/${data.patientId}`);
        revalidatePath('/dashboard/appointments');
        revalidatePath('/dashboard/billing');
        revalidateTag(`patient-${data.patientId}`);
        revalidateTag(`clinic-${clinicId}-appointments`);
        revalidateTag(`clinic-${clinicId}-inventory`);

        return {
            success: true,
            record: result.record,
            appointment: {
                ...result.appointment,
                service: { ...result.appointment.service, price: Number(result.appointment.service.price) }
            }
        };
    } catch (error: any) {
        console.error('Error al guardar nota médica:', error);
        return { success: false, error: 'Error al guardar el registro médico.' };
    }
}

/**
 * Crea una cita rápida y su nota clínica.
 * TENANT-SCOPED + RBAC.
 */
export async function createExpressAppointment(data: {
    patientId: string;
    diagnosis: string;
    notes?: string;
    prescription?: string;
    aiAdvice?: string;
    painMap?: any;
    serviceId?: string;
}) {
    const { db, user, clinicId } = await withTenant();
    requireRole(user.role, ['ADMIN', 'DOCTOR']);

    try {
        let serviceToUse;

        if (data.serviceId) {
            serviceToUse = await db.service.findUnique({ where: { id: data.serviceId } });
        }

        if (!serviceToUse) {
            serviceToUse = await db.service.findFirst({
                where: { active: true },
                orderBy: { price: 'asc' }
            });
        }

        if (!serviceToUse) throw new Error('No hay servicios activos disponibles');

        const defaultDoctor = await db.doctorProfile.findFirst();
        if (!defaultDoctor) throw new Error('No hay doctores registrados en esta clínica');

        const result = await db.$transaction(async (tx: any) => {
            const appointment = await tx.appointment.create({
                data: {
                    patientId: data.patientId,
                    doctorId: defaultDoctor.id,
                    serviceId: serviceToUse!.id,
                    createdById: user.id,
                    clinicId: clinicId!,
                    date: new Date(),
                    status: 'COMPLETED'
                }
            });

            const record = await tx.medicalRecord.create({
                data: {
                    appointmentId: appointment.id,
                    patientId: data.patientId,
                    clinicId: clinicId!,
                    diagnosis: data.diagnosis,
                    notes: data.notes,
                    prescription: data.prescription,
                    aiAdvice: data.aiAdvice,
                    painMap: data.painMap
                }
            });

            await tx.invoice.create({
                data: {
                    appointmentId: appointment.id,
                    clinicId: clinicId!,
                    totalAmount: serviceToUse!.price,
                    status: 'PENDING'
                }
            });

            return { appointment, record };
        });

        revalidatePath(`/dashboard/patients/${data.patientId}`);
        revalidatePath('/dashboard/appointments');
        revalidatePath('/dashboard/billing');
        revalidateTag(`patient-${data.patientId}`);
        revalidateTag(`clinic-${clinicId}-appointments`);

        return {
            success: true,
            appointment: {
                ...result.appointment,
                service: { ...serviceToUse, price: Number(serviceToUse.price) }
            },
            record: result.record
        };
    } catch (error: any) {
        console.error('Error al crear consulta rápida:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Appends a photo URL to a medical record.
 * TENANT-SCOPED.
 */
export async function appendMedicalPhoto(medicalRecordId: string, photoUrl: string) {
    const { db } = await withTenant();

    try {
        const record = await db.medicalRecord.findUnique({
            where: { id: medicalRecordId },
            select: { photos: true, patientId: true }
        });

        if (!record) return { success: false, error: 'Record not found' };

        await db.medicalRecord.update({
            where: { id: medicalRecordId },
            data: { photos: { set: [...(record.photos || []), photoUrl] } }
        });

        revalidatePath('/patient/history');
        revalidatePath('/dashboard/appointments');
        revalidatePath(`/dashboard/patients/${record.patientId}`);
        revalidateTag(`patient-${record.patientId}`);
        return { success: true };
    } catch (error) {
        console.error('Error appending photo:', error);
        return { success: false, error: 'Failed to save photo to record' };
    }
}
