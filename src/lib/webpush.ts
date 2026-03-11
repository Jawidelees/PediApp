import webpush from 'web-push';
import prisma from './prisma';

// Ensure you only set details if keys exist to avoid startup crashes in dev without env vars
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:soporte@clinica-pediatrica.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function sendPushNotification(userId: string, payload: { title: string, body: string, url?: string }) {
    try {
        const subscriptions = await prisma.notificationSubscription.findMany({
            where: { userId }
        });

        if (subscriptions.length === 0) return { success: false, error: 'User has no registered devices.' };

        const pushData = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: '/icons/icon-192x192.png',
            url: payload.url || '/patient'
        });

        const promises = subscriptions.map((sub: any) =>
            webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            }, pushData).catch(err => {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    console.log('Subscription has expired or is no longer valid: ', err);
                    return prisma.notificationSubscription.delete({ where: { id: sub.id } });
                } else {
                    console.error('Push notification failed: ', err);
                }
            })
        );

        await Promise.all(promises);
        return { success: true };
    } catch (error) {
        console.error('Error sending push notification:', error);
        return { success: false, error: 'Failed to send notification.' };
    }
}
