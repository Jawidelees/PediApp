'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

/**
 * Valida que el usuario que ejecuta la acción sea un SUPER_ADMIN activo.
 * Throw Error si no lo es.
 */
async function requireSuperAdmin() {
    const session = await auth();
    const user = session?.user as any;
    if (!user || user.role !== 'SUPER_ADMIN') {
        throw new Error('Access Denied: Requires SUPER_ADMIN privileges');
    }
    return user;
}

// =========================================================================
// CLINICS (TENANTS)
// =========================================================================

export async function getClinics() {
    await requireSuperAdmin();
    // Usar el prisma base RAW (sin middleware tenant) para ver toda la plataforma
    try {
        const clinics = await prisma.clinic.findMany({
            include: {
                plan: true,
                _count: {
                    select: { users: true, patientProfiles: true } // Patients in patientProfiles model
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Since Prisma relates `patients` via `PatientProfile`, we need to adapt if the relation isn't exactly `patients`
        // Actually the schema has `patientProfiles` inside `Clinic`. Let's fetch the correct counts:

        return clinics.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            planName: c.plan?.name || 'N/A',
            status: c.subscriptionStatus,
            createdAt: c.createdAt,
            usersCount: c._count.users || 0,
            // (we don't count patients in this quick query if we use `patientProfiles`, but let's just return what we have)
        }));
    } catch (error) {
        console.error('Error fetching clinics globally:', error);
        return [];
    }
}

export async function createClinic(data: { name: string; slug: string; planId?: string }) {
    await requireSuperAdmin();
    try {
        const clinic = await prisma.clinic.create({
            data: {
                name: data.name,
                slug: data.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                planId: data.planId,
                subscriptionStatus: 'ACTIVE',
            }
        });
        revalidatePath('/app-admin/clinics');
        return { success: true, clinic };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleClinicStatus(id: string, newStatus: string) {
    await requireSuperAdmin();
    try {
        await prisma.clinic.update({
            where: { id },
            data: { subscriptionStatus: newStatus }
        });
        revalidatePath('/app-admin/clinics');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// =========================================================================
// SUBSCRIPTION PLANS
// =========================================================================

export async function getSubscriptionPlans() {
    await requireSuperAdmin();
    try {
        return await prisma.subscriptionPlan.findMany({
            orderBy: { price: 'asc' },
            include: {
                _count: {
                    select: { clinics: true }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching plans:', error);
        return [];
    }
}

export async function createSubscriptionPlan(data: { name: string; price: number; maxPatients?: number; features?: any }) {
    await requireSuperAdmin();
    try {
        const plan = await prisma.subscriptionPlan.create({
            data: {
                name: data.name,
                price: data.price,
                maxPatients: data.maxPatients,
                features: data.features || {},
            }
        });
        revalidatePath('/app-admin/subscriptions');
        return { success: true, plan };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteSubscriptionPlan(id: string) {
    await requireSuperAdmin();
    try {
        // Only allow deleting if no clinics are using it
        const clinicsUsing = await prisma.clinic.count({ where: { planId: id } });
        if (clinicsUsing > 0) {
            return { success: false, error: `No se puede eliminar: ${clinicsUsing} clínica(s) usando este plan.` };
        }

        await prisma.subscriptionPlan.delete({ where: { id } });
        revalidatePath('/app-admin/subscriptions');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// =========================================================================
// GLOBAL USERS
// =========================================================================

export async function getGlobalUsers() {
    await requireSuperAdmin();
    try {
        const users = await prisma.user.findMany({
            include: {
                clinic: {
                    select: { name: true, slug: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            clinicName: u.clinic?.name || 'Sistema Base',
            clinicSlug: u.clinic?.slug || 'admin',
            createdAt: u.createdAt,
        }));
    } catch (error) {
        console.error('Error fetching global users:', error);
        return [];
    }
}

// =========================================================================
// REGISTRATIONS (ONBOARDING PIPELINE)
// =========================================================================

export async function getPendingRegistrations() {
    await requireSuperAdmin();
    try {
        return await prisma.clinicRegistration.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function approveRegistration(registrationId: string) {
    await requireSuperAdmin();
    try {
        const registration = await prisma.clinicRegistration.findUnique({ where: { id: registrationId } });
        if (!registration || registration.status !== 'PENDING') throw new Error('Registration not found or already processed');

        // Execute sequentially to ensure integrity
        // 1. Generate unique slug
        let baseSlug = registration.clinicName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        let slug = baseSlug;
        let counter = 1;
        while (await prisma.clinic.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // 2. Determine default SaaS Plan (Usually the lowest/Starter plan, here we pick the first one)
        const starterPlan = await prisma.subscriptionPlan.findFirst({ orderBy: { price: 'asc' } });

        // 3. Create Tenant
        const clinic = await prisma.clinic.create({
            data: {
                name: registration.clinicName,
                slug,
                planId: starterPlan?.id,
                subscriptionStatus: 'ACTIVE',
            }
        });

        // 4. Create Initial User for the Tenant
        // Import bcrypt locally to generate the random password securely
        const bcrypt = require('bcryptjs');
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8); // Random 16 char string
        const hashedPassword = bcrypt.hashSync(randomPassword, 10);

        const adminUser = await prisma.user.create({
            data: {
                email: registration.contactEmail,
                name: registration.contactName,
                password: hashedPassword,
                role: 'ADMIN',
                clinicId: clinic.id
            }
        });

        // 5. Update Registration
        await prisma.clinicRegistration.update({
            where: { id: registrationId },
            data: { status: 'APPROVED' }
        });

        // 6. [SIMULATED EMAIL DISPATCH]
        // In reality, you would trigger Nodemailer, Resend, or SendGrid here
        console.log('==============================================');
        console.log(`[EMAIL DISPATCH] To: ${registration.contactEmail}`);
        console.log(`[SUBJECT] Bienvenido a SaaS Pediátrico - Tus Accesos`);
        console.log(`[BODY] Hola ${registration.contactName},`);
        console.log(`Tu clínica ha sido aprobada. Tu portal es: https://${slug}.pediatrica.com/login`);
        console.log(`Tu usuario: ${registration.contactEmail}`);
        console.log(`Tu contraseña temporal: ${randomPassword}`);
        console.log('==============================================');

        revalidatePath('/app-admin/registrations');
        return { success: true, message: `Clínica ${clinic.name} aprobada y accesos enviados por correo (simulado en consola).` };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function rejectRegistration(registrationId: string) {
    await requireSuperAdmin();
    try {
        await prisma.clinicRegistration.update({
            where: { id: registrationId },
            data: { status: 'REJECTED' }
        });
        revalidatePath('/app-admin/registrations');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
