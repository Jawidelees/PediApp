'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { VaccineStatus } from '@prisma/client';

/**
 * Registra o actualiza un registro de vacunación.
 */
export async function upsertVaccinationRecord(data: {
    id?: string;
    patientId: string;
    vaccineName: string;
    dose: string;
    status: VaccineStatus;
    appliedDate?: string | null;
    nextDoseDate?: string | null;
    lotNumber?: string;
    notes?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('No autorizado');

    try {
        const record = await prisma.vaccinationRecord.upsert({
            where: { id: data.id || 'new-record' },
            update: {
                vaccineName: data.vaccineName,
                dose: data.dose,
                status: data.status,
                appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
                nextDoseDate: data.nextDoseDate ? new Date(data.nextDoseDate) : null,
                lotNumber: data.lotNumber,
                notes: data.notes,
            },
            create: {
                patientId: data.patientId,
                clinicId: (session.user as any).clinicId,
                vaccineName: data.vaccineName,
                dose: data.dose,
                status: data.status,
                appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
                nextDoseDate: data.nextDoseDate ? new Date(data.nextDoseDate) : null,
                lotNumber: data.lotNumber,
                notes: data.notes,
            },
        });

        revalidatePath(`/dashboard/patients/${data.patientId}`);
        revalidateTag(`patient-${data.patientId}`);
        return { success: true, record };
    } catch (error: any) {
        console.error('Error in upsertVaccinationRecord:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualiza los antecedentes perinatales del paciente.
 */
export async function updatePerinatalHistory(data: {
    patientId: string;
    gestationalWeeks?: number;
    birthWeight?: number;
    birthHeight?: number;
    apgarScore?: string;
    perinatalNotes?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('No autorizado');

    try {
        const updated = await prisma.patientProfile.update({
            where: { id: data.patientId },
            data: {
                gestationalWeeks: data.gestationalWeeks,
                birthWeight: data.birthWeight,
                birthHeight: data.birthHeight,
                apgarScore: data.apgarScore,
                perinatalNotes: data.perinatalNotes,
            },
        });

        revalidatePath(`/dashboard/patients/${data.patientId}`);
        revalidateTag(`patient-${data.patientId}`);
        return { success: true, profile: updated };
    } catch (error: any) {
        console.error('Error in updatePerinatalHistory:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Añade un nuevo registro de crecimiento.
 */
export async function addGrowthRecord(data: {
    patientId: string;
    weightKg?: number;
    heightCm?: number;
    headCircumferenceCm?: number;
    notes?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('No autorizado');

    try {
        // Aquí se podrían calcular percentiles si se tuviera la lógica en el backend,
        // por ahora el frontend los calcula para visualización.
        const record = await prisma.growthRecord.create({
            data: {
                patientId: data.patientId,
                clinicId: (session.user as any).clinicId,
                weightKg: data.weightKg,
                heightCm: data.heightCm,
                headCircumferenceCm: data.headCircumferenceCm,
                notes: data.notes,
                date: new Date(),
            },
        });

        revalidatePath(`/dashboard/patients/${data.patientId}`);
        revalidateTag(`patient-${data.patientId}`);
        return { success: true, record };
    } catch (error: any) {
        console.error('Error in addGrowthRecord:', error);
        return { success: false, error: error.message };
    }
}
