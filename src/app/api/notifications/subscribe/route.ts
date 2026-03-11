import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
    const session = await auth();
    // Requires authenticated user (either patient or staff)
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const subscription = await request.json();

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return new NextResponse('Invalid subscription data', { status: 400 });
        }

        const { endpoint, keys: { p256dh, auth: authKey } } = subscription;

        // Upsert the subscription (endpoint is unique per user)
        await prisma.notificationSubscription.upsert({
            where: {
                userId_endpoint: {
                    userId: session.user.id,
                    endpoint: endpoint,
                }
            },
            update: {
                p256dh,
                auth: authKey,
            },
            create: {
                userId: session.user.id,
                endpoint: endpoint,
                p256dh,
                auth: authKey,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving subscription:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
