import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email y contraseña son requeridos.' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 6 caracteres.' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Ya existe una cuenta con este correo.' },
                { status: 400 }
            );
        }

        // Create user (plain text password for dev — use bcrypt in production)
        const user = await prisma.user.create({
            data: {
                name: name || null,
                email,
                password, // TODO: bcrypt.hash(password, 12)
                role: 'PATIENT',
            },
        });

        // Create patient profile
        await prisma.patientProfile.create({
            data: {
                userId: user.id,
            },
        });

        return NextResponse.json({ success: true, userId: user.id });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor.' },
            { status: 500 }
        );
    }
}
