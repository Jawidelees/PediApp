import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        console.log('--- Diagnosis Route Started ---');

        // 1. Test connection
        const userCount = await prisma.user.count();
        console.log(`Connection success. User count: ${userCount}`);

        // 2. Ensure Super Admin
        const email = 'jawide03@gmail.com';
        const hashedPassword = bcrypt.hashSync('ClinicaPediatrica2026!', 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'SUPER_ADMIN',
                clinicId: null
            },
            create: {
                email,
                name: 'Super Admin',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                clinicId: null
            }
        });

        console.log(`User ${email} ensured as SUPER_ADMIN.`);

        return NextResponse.json({
            success: true,
            message: 'Database connection verified and Super Admin ensured.',
            userCount,
            user: {
                email: user.email,
                role: user.role
            }
        });
    } catch (error: any) {
        console.error('Diagnosis failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
