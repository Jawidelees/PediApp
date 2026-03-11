import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPushNotification } from '@/lib/webpush';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // En Vercel, deberías proteger este endpoint con CRON_SECRET
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

        // Fetch pending or partial invoices with promised date today or tomorrow
        const invoicesResult = await prisma.invoice.findMany({
            where: {
                status: { in: ['PENDING', 'PARTIAL'] as any },
                promisedDate: {
                    gte: today,
                    lt: dayAfterTomorrow
                } as any
            } as any,
            include: {
                transactions: true,
                appointment: {
                    include: {
                        patient: {
                            include: {
                                user: {
                                    include: {
                                        pushSubscriptions: true
                                    } as any
                                }
                            }
                        }
                    }
                }
            } as any
        });

        let notificationsSent = 0;
        const invoices = invoicesResult as any[];

        for (const invoice of invoices) {
            const patientUser = invoice.appointment?.patient?.user;
            if (!patientUser || !patientUser.pushSubscriptions || patientUser.pushSubscriptions.length === 0) {
                continue;
            }

            const promisedDate = new Date(invoice.promisedDate);
            const isToday = promisedDate >= today && promisedDate < tomorrow;

            const remainingAmount = Number(invoice.totalAmount) - (invoice.transactions?.reduce((acc: number, t: any) => acc + Number(t.amount), 0) || 0);

            const title = 'Recordatorio de Pago 🏥';
            const message = isToday
                ? `Hoy es la fecha prometida para tu pago de Q${remainingAmount}. Puedes acercarte a la clínica o pagar en línea.`
                : `Mañana vence tu pago pendiente de Q${remainingAmount}. ¡Te esperamos en Clínica Pediátrica!`;

            try {
                await sendPushNotification(patientUser.id, {
                    title,
                    body: message,
                    url: '/patient/history' // Link to history where they can see receipts
                });
                notificationsSent++;
            } catch (err) {
                console.error('Error sending push to patient:', err);
            }
        }

        return NextResponse.json({ success: true, count: invoices.length, sent: notificationsSent });

    } catch (error: any) {
        console.error('Cron error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
