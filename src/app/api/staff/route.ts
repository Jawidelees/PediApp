import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/staff — List all staff members (non-PATIENT users)
 */
export async function GET() {
    const session = await auth();
    const user = session?.user as any;

    if (!user?.id || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const staff = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] }
            },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
                doctorProfile: {
                    select: {
                        specialty: true,
                        license: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(staff);
    } catch (error: any) {
        console.error('Error listing staff:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/staff — Create a new staff member (DOCTOR or RECEPTIONIST)
 */
export async function POST(request: Request) {
    const session = await auth();
    const currentUser = session?.user as any;

    if (!currentUser?.id || currentUser.role !== 'ADMIN') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { firstName, lastName, email, username, password, role, specialty, license } = body;

        // --- Validations ---
        if (!firstName || !firstName.trim()) {
            return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        if (!lastName || !lastName.trim()) {
            return NextResponse.json({ error: 'El apellido es obligatorio' }, { status: 400 });
        }

        // At least email or username must be provided
        const hasEmail = email && email.trim().length > 0;
        const hasUsername = username && username.trim().length > 0;

        if (!hasEmail && !hasUsername) {
            return NextResponse.json({ error: 'Debe proporcionar un correo electrónico o un nombre de usuario' }, { status: 400 });
        }

        // Email format validation
        if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return NextResponse.json({ error: 'El formato del correo electrónico no es válido' }, { status: 400 });
        }

        // Username validation: only letters, numbers, dots, underscores
        if (hasUsername && !/^[a-zA-Z0-9._]{3,30}$/.test(username.trim())) {
            return NextResponse.json({ error: 'El nombre de usuario solo puede contener letras, números, puntos y guiones bajos (3-30 caracteres)' }, { status: 400 });
        }

        if (!password || password.length < 6) {
            return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
        }

        if (!['DOCTOR', 'RECEPTIONIST'].includes(role)) {
            return NextResponse.json({ error: 'Rol inválido. Debe ser DOCTOR o RECEPTIONIST' }, { status: 400 });
        }

        // Check uniqueness
        if (hasEmail) {
            const existingEmail = await prisma.user.findUnique({ where: { email: email.trim() } });
            if (existingEmail) {
                return NextResponse.json({ error: 'Ya existe un usuario con ese correo electrónico' }, { status: 409 });
            }
        }

        if (hasUsername) {
            const existingUsername = await prisma.user.findUnique({ where: { username: username.trim() } });
            if (existingUsername) {
                return NextResponse.json({ error: 'Ya existe un usuario con ese nombre de usuario' }, { status: 409 });
            }
        }

        // Build full name
        const fullName = `${firstName.trim()} ${lastName.trim()}`;

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name: fullName,
                email: hasEmail ? email.trim() : null,
                username: hasUsername ? username.trim() : null,
                password,
                role,
            },
        });

        // If DOCTOR, create the DoctorProfile
        if (role === 'DOCTOR') {
            await prisma.doctorProfile.create({
                data: {
                    userId: newUser.id,
                    specialty: specialty?.trim() || 'Pediatría General',
                    license: license?.trim() || null,
                },
            });
        }

        // Create in-app notification for the admin
        await prisma.appNotification.create({
            data: {
                userId: currentUser.id,
                title: 'Nuevo colaborador registrado',
                message: `${fullName} (${role === 'DOCTOR' ? 'Pediatra' : 'Recepcionista'}) ha sido añadido al sistema.`,
                type: 'SUCCESS',
                link: '/dashboard/settings/users',
            },
        });

        return NextResponse.json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role,
            createdAt: newUser.createdAt,
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating staff:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
