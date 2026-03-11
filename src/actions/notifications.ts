'use server';

import { auth } from '@/auth';
import { sendPushNotification } from '@/lib/webpush';
import prisma from '@/lib/prisma';

export async function notifyPatient(patientProfileId: string, title: string, body: string, url?: string) {
    const session = await auth();
    const user = session?.user as any;
    // Only Doctor or Admin can trigger notifications
    if (!user || user.role === 'PATIENT' || user.role === 'RECEPTIONIST' || !user.clinicId) {
        throw new Error('Unauthorized');
    }
    const clinicId = user.clinicId;

    try {
        // Resolve patient's user id and verify same clinic
        const patient = await prisma.patientProfile.findUnique({
            where: { id: patientProfileId },
            include: { user: { select: { clinicId: true } } }
        });

        if (!patient || patient.user?.clinicId !== clinicId) throw new Error('Patient not found in your clinic');

        // Execute Push and DB save in parallel for better performance
        const [pushResult] = await Promise.all([
            sendPushNotification(patient.userId, { title, body, url }),
            (prisma as any).appNotification.create({
                data: {
                    userId: patient.userId,
                    title,
                    message: body,
                    type: 'INFO',
                    link: url || '/patient'
                }
            })
        ]);

        return { success: true, pushResult };
    } catch (error: any) {
        console.error('Error notifying patient:', error);
        return { success: false, error: error.message || 'Notification failed.' };
    }
}
