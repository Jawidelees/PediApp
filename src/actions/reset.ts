'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function resetDatabase(confirmationText: string) {
    try {
        const session = await auth();
        const user = session?.user as any;
        const clinicId = user?.clinicId;

        if (!user || user.role !== 'ADMIN' || !clinicId) {
            return { success: false, error: 'Acceso denegado. Solo administradores pueden realizar esta acción.' };
        }

        if (confirmationText !== 'ELIMINAR TODO') {
            return { success: false, error: 'Texto de confirmación incorrecto.' };
        }

        // Ejecutar las eliminaciones en una transacción secuencial
        // para respetar las llaves foráneas y limpiar todos los módulos
        await prisma.$transaction([
            // 1. Notificaciones
            (prisma as any).appNotification.deleteMany({ where: { user: { clinicId } } }),
            prisma.notificationSubscription.deleteMany({ where: { user: { clinicId } } }),

            // 2. Historial Médico y Pediátrico
            prisma.treatmentPlan.deleteMany({ where: { clinicId } }),
            prisma.growthRecord.deleteMany({ where: { clinicId } }),
            prisma.vaccinationRecord.deleteMany({ where: { clinicId } }),
            prisma.medicalRecord.deleteMany({ where: { clinicId } }),

            // 3. Facturación e Inventario
            prisma.paymentTransaction.deleteMany({ where: { invoice: { clinicId } } }),
            prisma.invoice.deleteMany({ where: { clinicId } }),
            prisma.inventoryUsage.deleteMany({ where: { appointment: { clinicId } } }),

            // 4. Citas
            prisma.appointment.deleteMany({ where: { clinicId } }),

            // 5. Perfiles de Paciente
            prisma.patientProfile.deleteMany({ where: { user: { clinicId } } }),

            // 6. Cuentas de Usuario de Pacientes
            // Solamente borramos usuarios con rol PATIENT dentro de esta clínica
            prisma.user.deleteMany({
                where: {
                    clinicId: clinicId,
                    role: 'PATIENT'
                }
            }),

            // 7. Resetear Inventario
            // No borramos la lista de artículos, solo los devolvemos a Stock 0.
            prisma.inventoryItem.updateMany({
                where: { clinicId },
                data: {
                    stock: 0,
                    openPackageUnits: 0
                }
            })
        ]);

        console.log(`✅ Base de datos reseteada exitosamente por Admin: ${user.email} en Clínica: ${clinicId}`);

        // Revalidar todo el panel
        revalidatePath('/dashboard', 'layout');
        return { success: true };

    } catch (error) {
        console.error('Error durante Factory Reset:', error);
        return { success: false, error: 'Error interno al intentar purgar la base de datos.' };
    }
}
