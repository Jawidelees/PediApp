import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

import { generateSmartPatientNotifications } from '@/actions/app-notifications';

export async function GET(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // Trigger smart notifications generation in background
        generateSmartPatientNotifications(session.user.id).catch(console.error);

        const profile = await prisma.patientProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                appointments: {
                    include: { service: true, invoice: true },
                    orderBy: { date: 'asc' } // Closest first
                },
                growthRecords: true,
                vaccinations: true,
                treatmentPlans: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!profile) {
            return new NextResponse('Profile not found', { status: 404 });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Error fetching patient data:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
