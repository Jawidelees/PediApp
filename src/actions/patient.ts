'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { withTenant, requireRole } from '@/lib/with-tenant';
import { logMedicalAccess } from './audit';

/**
 * Obtiene el perfil del paciente actual basado en la sesión.
 */
export async function getPatientProfile() {
    const { db, user } = await withTenant();

    try {
        const profile = await db.patientProfile.findUnique({
            where: { userId: user.id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        username: true,
                    },
                },
            },
        });
        return profile;
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        return null;
    }
}

/**
 * Actualiza la información del perfil del paciente.
 */
export async function updatePatientProfile(data: {
    name?: string;
    phone?: string;
    address?: string;
    nit?: string;
    birthDate?: string;
}) {
    const { db, user } = await withTenant();

    try {
        // Actualizar nombre en User si viene
        if (data.name) {
            await db.user.update({
                where: { id: user.id },
                data: { name: data.name },
            });
        }

        // Actualizar Profile
        const updated = await db.patientProfile.update({
            where: { userId: user.id },
            data: {
                phone: data.phone,
                address: data.address,
                nit: data.nit,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            },
        });

        revalidatePath('/patient/profile');
        return { success: true, profile: updated };
    } catch (error: any) {
        console.error('Error actualizando perfil:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualiza las credenciales del paciente.
 */
export async function updatePatientCredentials(data: {
    email?: string;
    username?: string;
    password?: string;
}) {
    const { db, user } = await withTenant();

    try {
        const updateData: any = {};
        if (data.email) updateData.email = data.email.toLowerCase();
        if (data.username) updateData.username = data.username.toLowerCase();
        if (data.password) updateData.password = bcrypt.hashSync(data.password, 10);

        if (Object.keys(updateData).length === 0) return { success: true };

        await db.user.update({
            where: { id: user.id },
            data: updateData,
        });

        revalidatePath('/patient/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error actualizando credenciales:', error);
        if (error.code === 'P2002') {
            return { success: false, error: 'El correo o usuario ya está en uso.' };
        }
        return { success: false, error: error.message };
    }
}


/**
 * Obtiene el historial de citas del paciente.
 */
export async function getPatientAppointments() {
    const { db, user } = await withTenant();

    try {
        const profile = await db.patientProfile.findUnique({
            where: { userId: user.id },
        });

        if (!profile) return [];

        const appointments = await db.appointment.findMany({
            where: { patientId: profile.id },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: { name: true },
                        },
                    },
                },
                service: true,
                medicalRecord: true,
                invoice: {
                    include: { transactions: true }
                } as any,
            },
            orderBy: { date: 'desc' },
        });

        return appointments.map(apt => ({
            ...apt,
            service: apt.service ? { ...apt.service, price: Number(apt.service.price) } : null
        }));
    } catch (error) {
        console.error('Error obteniendo citas:', error);
        return [];
    }
}

/**
 * Obtiene la lista completa de pacientes (para admin/doctores).
 * TENANT-SCOPED: Solo devuelve pacientes de la clínica del usuario.
 */
export async function getPatients() {
    const { db, user } = await withTenant();
    requireRole(user.role, ['ADMIN', 'DOCTOR', 'RECEPTIONIST']);

    try {
        const patients = await db.patientProfile.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: { appointments: true },
                },
            },
            orderBy: {
                user: { name: 'asc' },
            },
        });
        return patients;
    } catch (error) {
        console.error('Error obteniendo lista de pacientes:', error);
        return [];
    }
}

/**
 * Obtiene el detalle completo de un paciente por ID.
 * TENANT-SCOPED + AUDIT LOG.
 */
export async function getPatientDetails(patientProfileId: string) {
    const { db, user } = await withTenant();

    try {
        const patient = await db.patientProfile.findUnique({
            where: { id: patientProfileId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                appointments: {
                    include: {
                        service: true,
                        doctor: {
                            include: {
                                user: { select: { name: true } },
                            },
                        },
                        medicalRecord: true,
                    },
                    orderBy: { date: 'desc' },
                },
                growthRecords: true,
                vaccinations: true,
                treatmentPlans: {
                    orderBy: { createdAt: 'desc' }
                }
            } as any,
        });
        if (!patient) return null;

        // Log access to sensitive medical data
        logMedicalAccess({
            action: 'READ_MEDICAL_HISTORY',
            resource: 'PatientProfile',
            resourceId: patientProfileId
        }).catch(console.error);

        return {
            ...patient,
            appointments: (patient as any).appointments.map((apt: any) => ({
                ...apt,
                service: apt.service ? { ...apt.service, price: Number(apt.service.price) } : null
            }))
        };
    } catch (error) {
        console.error('Error obteniendo detalle de paciente:', error);
        return null;
    }
}

/**
 * Registra un nuevo paciente desde el dashboard (Admin/Recepción).
 * TENANT-SCOPED: Asigna automáticamente clinicId de la sesión.
 */
export async function registerPatient(data: {
    name: string;
    email?: string;
    username?: string;
    phone: string;
    address: string;
    nit: string;
    birthDate?: string;
    allergies?: string;
    gestationalWeeks?: number;
    birthWeight?: number;
    birthHeight?: number;
    apgarScore?: string;
    perinatalNotes?: string;
}) {
    const { db, user, clinicId } = await withTenant();
    requireRole(user.role, ['ADMIN', 'RECEPTIONIST', 'DOCTOR']);

    try {
        // Generar clave temporal de 6 caracteres
        const tempPassword = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Usar una transacción para asegurar integridad
        const result = await db.$transaction(async (tx: any) => {
            // 1. Crear el usuario (clinicId se inyecta automáticamente por tenant middleware)
            const newUser = await tx.user.create({
                data: {
                    name: data.name,
                    email: data.email ? data.email.toLowerCase() : null,
                    username: data.username ? data.username.toLowerCase() : null,
                    password: bcrypt.hashSync(tempPassword, 10),
                    role: 'PATIENT',
                    clinicId: clinicId!, // Explícito para transacciones
                }
            });

            // 2. Crear el perfil de paciente
            const profile = await tx.patientProfile.create({
                data: {
                    userId: newUser.id,
                    phone: data.phone,
                    address: data.address,
                    nit: data.nit,
                    birthDate: data.birthDate ? new Date(data.birthDate) : null,
                    allergies: data.allergies,
                    gestationalWeeks: data.gestationalWeeks ? Number(data.gestationalWeeks) : null,
                    birthWeight: data.birthWeight ? Number(data.birthWeight) : null,
                    birthHeight: data.birthHeight ? Number(data.birthHeight) : null,
                    apgarScore: data.apgarScore || null,
                    perinatalNotes: data.perinatalNotes || null,
                    clinicId: clinicId!, // Explícito para transacciones
                }
            });

            return { user: newUser, profile, tempPassword };
        });

        revalidatePath('/dashboard/patients');
        return { success: true, credentials: { identifier: (result.user.email || result.user.username) as string, password: result.tempPassword } };
    } catch (error: any) {
        console.error('Error registrando paciente:', error);
        if (error.code === 'P2002') {
            return { success: false, error: 'El correo electrónico ya está registrado.' };
        }
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene todas las citas del sistema (Admin/Doctor).
 * TENANT-SCOPED: Solo citas de la clínica del usuario.
 */
export async function getAppointments() {
    const { db, user } = await withTenant();
    requireRole(user.role, ['ADMIN', 'DOCTOR', 'RECEPTIONIST']);

    try {
        const appointments = await db.appointment.findMany({
            include: {
                patient: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
                service: true,
                doctor: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
            orderBy: { date: 'desc' },
        });

        return appointments.map(apt => ({
            ...apt,
            service: apt.service ? { ...apt.service, price: Number(apt.service.price) } : null
        }));
    } catch (error) {
        console.error('Error obteniendo todas las citas:', error);
        return [];
    }
}

/**
 * Soft-delete de un paciente y TODO su historial asociado.
 * TENANT-SCOPED + SOFT DELETE (marca deletedAt en lugar de borrar).
 */
export async function deletePatient(patientProfileId: string) {
    const { db, user } = await withTenant();
    requireRole(user.role, ['ADMIN']);

    try {
        const profile = await db.patientProfile.findUnique({
            where: { id: patientProfileId },
            select: { userId: true, id: true }
        });

        if (!profile) {
            return { success: false, error: 'Paciente no encontrado' };
        }

        const now = new Date();

        // Obtener todas las citas para soft-delete sus dependencias
        const appointments = await db.appointment.findMany({
            where: { patientId: patientProfileId },
            select: { id: true }
        });
        const appointmentIds = appointments.map((a: any) => a.id);

        await db.$transaction(async (tx: any) => {
            if (appointmentIds.length > 0) {
                // 1. Soft-delete uso de inventario asociado
                await tx.inventoryUsage.updateMany({
                    where: { appointmentId: { in: appointmentIds } },
                    data: {} // No tiene deletedAt, mantener como está
                });

                // 2. Soft-delete facturas
                await tx.invoice.updateMany({
                    where: { appointmentId: { in: appointmentIds } },
                    data: { deletedAt: now }
                });
            }

            // 3. Soft-delete historial médico y planes
            await tx.medicalRecord.updateMany({ where: { patientId: patientProfileId }, data: { deletedAt: now } });
            await tx.growthRecord.updateMany({ where: { patientId: patientProfileId }, data: { deletedAt: now } });
            await tx.vaccinationRecord.updateMany({ where: { patientId: patientProfileId }, data: { deletedAt: now } });
            await tx.treatmentPlan.updateMany({ where: { patientId: patientProfileId }, data: { deletedAt: now } });

            // 4. Soft-delete las citas
            await tx.appointment.updateMany({ where: { patientId: patientProfileId }, data: { deletedAt: now } });

            // 5. Soft-delete el perfil del paciente
            await tx.patientProfile.update({ where: { id: patientProfileId }, data: { deletedAt: now } });

            // 6. Soft-delete el usuario
            await tx.user.update({ where: { id: profile.userId }, data: { deletedAt: now } });
        });

        revalidatePath('/dashboard/patients');
        return { success: true };
    } catch (error: any) {
        console.error('Error eliminando paciente:', error);
        return { success: false, error: error.message || 'Error desconocido al eliminar el paciente.' };
    }
}
