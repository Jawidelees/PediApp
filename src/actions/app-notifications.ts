'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { sendPushNotification } from '@/lib/webpush';

export async function getAdminNotifications() {
    const session = await auth();
    if (!session?.user?.id || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'DOCTOR')) {
        return [];
    }

    try {
        const notifications = await (prisma as any).appNotification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return notifications;
    } catch (error) {
        console.error('Error fetching admin notifications:', error);
        return [];
    }
}

export async function getUserNotifications() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    try {
        const notifications = await (prisma as any).appNotification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 30
        });
        return notifications;
    } catch (error) {
        console.error('Error fetching user notifications:', error);
        return [];
    }
}

export async function markNotificationAsRead(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    try {
        const notification = await (prisma as any).appNotification.findUnique({
            where: { id }
        });

        if (!notification || notification.userId !== session.user.id) {
            return { success: false, error: 'No autorizado' };
        }

        await (prisma as any).appNotification.update({
            where: { id },
            data: { read: true }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false };
    }
}

export async function markAllNotificationsAsRead() {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    try {
        await (prisma as any).appNotification.updateMany({
            where: {
                userId: session.user.id,
                read: false
            },
            data: { read: true }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return { success: false };
    }
}

export async function createAdminSystemNotification({ title, message, type = 'INFO', link }: { title: string, message: string, type?: string, link?: string }) {
    const session = await auth();
    const clinicId = (session?.user as any)?.clinicId;
    if (!clinicId) return;

    try {
        // Fetch all admins and doctors to notify them (ONLY in this clinic)
        const admins = await prisma.user.findMany({
            where: {
                clinicId: clinicId,
                role: { in: ['ADMIN', 'DOCTOR'] }
            }
        });

        if (admins.length > 0) {
            await (prisma as any).appNotification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title,
                    message,
                    type,
                    link
                }))
            });

            // Enviar Push Notifications a todos los Admins/Doctores en background
            Promise.all(admins.map(admin =>
                sendPushNotification(admin.id, { title, body: message, url: link })
            )).catch(err => console.error("Error pushing to admins:", err));

            revalidatePath('/dashboard', 'layout');
        }
    } catch (error) {
        console.error('Error creating system notification:', error);
    }
}

export async function generateSmartPatientNotifications(patientUserId: string) {
    try {
        const patientRaw = await prisma.user.findUnique({
            where: { id: patientUserId },
            include: {
                patientProfile: {
                    include: {
                        appointments: {
                            where: {
                                status: 'SCHEDULED', // Unconfirmed
                                date: {
                                    gte: new Date(),
                                    lte: new Date(Date.now() + 48 * 60 * 60 * 1000) // Next 48 hours
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!patientRaw || !patientRaw.patientProfile) return;

        const profileId = patientRaw.patientProfile.id;

        // 1. Check for unconfirmed appointments
        const unconfirmedAppointments = patientRaw.patientProfile.appointments;
        for (const apt of unconfirmedAppointments) {
            // Check if we already notified them about this specific appointment confirmation recently (within 24 hours)
            const recentAptNotification = await (prisma as any).appNotification.findFirst({
                where: {
                    userId: patientUserId,
                    type: 'WARNING',
                    title: 'Confirmación de Cita Requerida',
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            });

            if (!recentAptNotification) {
                const formattedDate = new Date(apt.date).toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' });
                const formattedTime = new Date(apt.date).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
                const title = 'Confirmación de Cita Requerida';
                const body = `Tienes una cita programada para el ${formattedDate} a las ${formattedTime}. Por favor, confirma tu asistencia para mantener tu espacio reservado.`;
                const url = `/patient/history?highlight=${apt.id}`;

                await (prisma as any).appNotification.create({
                    data: {
                        userId: patientUserId,
                        title: title,
                        message: body,
                        type: 'WARNING',
                        link: url
                    }
                });

                sendPushNotification(patientUserId, { title, body, url }).catch(console.error);
            }
        }

        // 2. Check for Pending/Partial Invoices
        // We find appointments belonging to this patient that have a pending invoice
        const pendingInvoices = await prisma.invoice.findMany({
            where: {
                status: { in: ['PENDING', 'PARTIAL' as any] },
                appointment: {
                    patientId: profileId
                }
            }
        });

        if (pendingInvoices.length > 0) {
            // Check if we already sent a payment reminder today
            const recentBillingNotification = await (prisma as any).appNotification.findFirst({
                where: {
                    userId: patientUserId,
                    type: 'ERROR',
                    title: 'Recordatorio de Saldo Pendiente',
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            });

            if (!recentBillingNotification) {
                const totalDebt = pendingInvoices.reduce((sum, inv) => {
                    // For a highly accurate calculation we would need transaction sums, 
                    // but for a notification, just signaling debt is enough.
                    return sum + Number(inv.totalAmount); // Simplified
                }, 0);

                const title = 'Recordatorio de Saldo Pendiente';
                const body = `Estimado paciente, tienes saldos pendientes en tu cuenta clínica. Por favor, revisa tu historial para regularizar los pagos a la brevedad posible.`;
                const url = '/patient/history';

                await (prisma as any).appNotification.create({
                    data: {
                        userId: patientUserId,
                        title: title,
                        message: body,
                        type: 'ERROR',
                        link: url
                    }
                });

                sendPushNotification(patientUserId, { title, body, url }).catch(console.error);
            }
        }

    } catch (error) {
        console.error('Error generating smart notifications:', error);
    }
}

export async function createPatientNotification({
    patientUserId,
    title,
    message,
    type = 'INFO',
    link
}: {
    patientUserId: string,
    title: string,
    message: string,
    type?: string,
    link?: string
}) {
    try {
        await (prisma as any).appNotification.create({
            data: {
                userId: patientUserId,
                title,
                message,
                type,
                link
            }
        });

        // Push notification
        await sendPushNotification(patientUserId, {
            title,
            body: message,
            url: link
        });

        revalidatePath('/patient/history');
    } catch (error) {
        console.error('Error creating patient notification:', error);
    }
}
