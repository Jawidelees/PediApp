'use server';

import prisma from '@/lib/prisma';

export async function submitClinicRegistration(data: {
    clinicName: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    notes?: string;
}) {
    try {
        // En un entorno de producción, aquí verificaríamos reCAPTCHA u otro sistema anti-spam

        const exists = await prisma.clinicRegistration.findFirst({
            where: { contactEmail: data.contactEmail, status: 'PENDING' }
        });

        if (exists) {
            return { success: false, error: 'Ya existe una solicitud pendiente con este correo.' };
        }

        const registration = await prisma.clinicRegistration.create({
            data: {
                clinicName: data.clinicName,
                contactName: data.contactName,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
                notes: data.notes,
                status: 'PENDING'
            }
        });

        return { success: true, registrationId: registration.id };
    } catch (error: any) {
        console.error('Error submitting registration:', error);
        return { success: false, error: error.message };
    }
}
