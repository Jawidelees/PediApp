'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function setupInitialClinic(data: {
    clinicName: string;
    clinicSlug: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
}) {
    try {
        // Enforce lowercase slug
        const slug = data.clinicSlug.toLowerCase().trim();

        // 1. Check if clinic already exists
        const existingClinic = await prisma.clinic.findUnique({
            where: { slug }
        });

        if (existingClinic) {
            return { success: false, error: 'La clínica con este slug ya existe.' };
        }

        // 2. Create Clinic and Admin User in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const clinic = await tx.clinic.create({
                data: {
                    name: data.clinicName,
                    slug: slug,
                }
            });

            const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

            const user = await tx.user.create({
                data: {
                    name: data.adminName,
                    email: data.adminEmail,
                    password: hashedPassword,
                    role: 'ADMIN',
                    clinicId: clinic.id,
                }
            });

            return { clinic, user };
        });

        return {
            success: true,
            message: `Clínica ${result.clinic.name} y administrador ${result.user.name} creados correctamente.`,
            setup: {
                clinicId: result.clinic.id,
                adminId: result.user.id
            }
        };

    } catch (error: any) {
        console.error('Error in setupInitialClinic:', error);
        return { success: false, error: error.message };
    }
}
