import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const data = {
            timestamp: new Date().toISOString(),
            metadata: {
                version: '1.0',
                app: 'Clínica Pediátrica CRM'
            },
            collections: {
                users: await prisma.user.findMany(),
                doctorProfiles: await prisma.doctorProfile.findMany(),
                patientProfiles: await prisma.patientProfile.findMany(),
                services: await prisma.service.findMany(),
                appointments: await prisma.appointment.findMany(),
                inventoryItems: await prisma.inventoryItem.findMany(),
                inventoryUsages: await prisma.inventoryUsage.findMany(),
                medicalRecords: await prisma.medicalRecord.findMany(),
                growthRecords: await prisma.growthRecord.findMany(),
                vaccinations: await prisma.vaccinationRecord.findMany(),
                invoices: await prisma.invoice.findMany(),
            }
        };

        // return as JSON file attachment
        return new NextResponse(JSON.stringify(data, null, 2), {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="clinica_pediatrica_backup_${new Date().toISOString().split('T')[0]}.json"`,
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('Backup error:', error);
        return new NextResponse('Error generating backup', { status: 500 });
    }
}
