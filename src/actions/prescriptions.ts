'use server';

import { revalidatePath } from 'next/cache';
import { withTenant, requireRole } from '@/lib/with-tenant';

/**
 * Guarda una receta digital y opcionalmente la marca como enviada.
 * TENANT-SCOPED + RBAC (solo doctores).
 */
export async function saveDigitalPrescription(data: {
    patientId: string;
    appointmentId?: string;
    diagnosis: string;
    medications: Array<{
        name: string;
        dose: string;
        frequency: string;
        duration: string;
        instructions?: string;
    }>;
}) {
    const { db, user, clinicId } = await withTenant();
    requireRole(user.role, ['ADMIN', 'DOCTOR']);

    try {
        let record;

        if (data.appointmentId) {
            record = await (db.medicalRecord as any).update({
                where: { appointmentId: data.appointmentId },
                data: {
                    prescription: JSON.stringify(data.medications),
                    diagnosis: data.diagnosis
                }
            });
        } else {
            const defaultDoctor = await db.doctorProfile.findFirst();
            const service = await db.service.findFirst({ where: { active: true } });

            const appointment = await db.appointment.create({
                data: {
                    patientId: data.patientId,
                    doctorId: defaultDoctor!.id,
                    serviceId: service!.id,
                    createdById: user.id,
                    clinicId: clinicId!,
                    date: new Date(),
                    status: 'COMPLETED'
                }
            });

            record = await (db.medicalRecord as any).create({
                data: {
                    appointmentId: appointment.id,
                    patientId: data.patientId,
                    clinicId: clinicId!,
                    diagnosis: data.diagnosis,
                    prescription: JSON.stringify(data.medications)
                }
            });
        }

        revalidatePath(`/dashboard/patients/${data.patientId}`);
        return { success: true, recordId: record.id };
    } catch (error: any) {
        console.error('Error saving prescription:', error);
        return { success: false, error: error.message };
    }
}
