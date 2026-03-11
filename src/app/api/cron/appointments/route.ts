import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPushNotification } from '@/lib/webpush';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Para simplificar la validación del cron de Vercel
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const targetTimeStart = new Date();
        targetTimeStart.setMinutes(targetTimeStart.getMinutes() + 85); // 85 min

        const targetTimeEnd = new Date(targetTimeStart);
        targetTimeEnd.setMinutes(targetTimeEnd.getMinutes() + 10); // Ventana de 10 min

        const upcomingAppointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: targetTimeStart,
                    lt: targetTimeEnd,
                },
                status: {
                    in: ['SCHEDULED', 'CONFIRMED']
                }
            },
            include: {
                patient: {
                    include: {
                        user: {
                            include: {
                                pushSubscriptions: true
                            }
                        }
                    }
                },
                doctor: {
                    include: {
                        user: true
                    }
                }
            }
        });

        let notificationsSent = 0;

        for (const appt of upcomingAppointments) {
            if (!appt.patient.user) continue;

            const apptDate = new Date(appt.date);
            const timeStr = apptDate.toLocaleTimeString('es-GT', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: 'America/Guatemala'
            });

            const title = 'Recordatorio de Cita 🦷';
            const message = `Clínica Pediátrica: Hola ${appt.patient.user.name}, te recordamos tu cita hoy a las ${timeStr}. ¡Te esperamos!`;

            // 1. Crear notificación en la base de datos (AppNotification)
            await prisma.appNotification.create({
                data: {
                    userId: appt.patient.user.id,
                    title,
                    message,
                    type: 'INFO',
                    link: '/patient/appointments'
                }
            });

            // 2. Enviar Push Notification si el usuario tiene suscripciones
            if (appt.patient.user.pushSubscriptions && appt.patient.user.pushSubscriptions.length > 0) {
                try {
                    await sendPushNotification(appt.patient.user.id, {
                        title,
                        body: message,
                        url: '/patient/appointments'
                    });
                } catch (err) {
                    console.error('Error sending push reminder:', err);
                }
            }

            notificationsSent++;
        }

        return NextResponse.json({
            success: true,
            found: upcomingAppointments.length,
            notificationsSent
        });
    } catch (error: any) {
        console.error('Error in appointment cron job:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
