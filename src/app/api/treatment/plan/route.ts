import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
    const session = await auth();
    // Only Doctor or Admin can create treatment plans
    if (!session?.user || (session.user as any).role === 'PATIENT' || (session.user as any).role === 'RECEPTIONIST') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await request.json();
        const { patientId, title, description, totalPhases } = body;

        const plan = await prisma.treatmentPlan.create({
            data: {
                patientId,
                title,
                description,
                totalPhases: Number(totalPhases) || 1,
                currentPhase: 1,
                status: 'ACTIVE'
            }
        });

        return NextResponse.json(plan);
    } catch (error) {
        console.error('Error creating plan:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await auth();
    if (!session?.user || (session.user as any).role === 'PATIENT' || (session.user as any).role === 'RECEPTIONIST') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await request.json();
        const { planId, currentPhase } = body;

        // Fetch to check completion
        const existing = await prisma.treatmentPlan.findUnique({ where: { id: planId } });
        if (!existing) return new NextResponse('Not found', { status: 404 });

        let status = existing.status;
        if (currentPhase >= existing.totalPhases) {
            status = 'COMPLETED';
        }

        const plan = await prisma.treatmentPlan.update({
            where: { id: planId },
            data: {
                currentPhase: currentPhase,
                status,
                actualEndDate: status === 'COMPLETED' ? new Date() : null
            }
        });

        return NextResponse.json(plan);
    } catch (error) {
        console.error('Error updating plan:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
