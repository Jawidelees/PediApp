'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { sendPushNotification } from '@/lib/webpush';
import { createAdminSystemNotification } from './app-notifications';
import { withTenant, requireRole } from '@/lib/with-tenant';
import prisma from '@/lib/prisma';

interface AppointmentData {
  doctorId: string;
  serviceId: string;
  date: string | Date;
  notes?: string;
}

interface StaffAppointmentData extends AppointmentData {
  patientId: string;
}

/**
 * Crea una nueva cita para el paciente autenticado.
 * TENANT-SCOPED.
 */
export async function createPatientAppointment(data: AppointmentData) {
  const { db, user, clinicId } = await withTenant();

  try {
    const profile = await db.patientProfile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) throw new Error('Perfil de paciente no encontrado');

    // Verificar colisiones
    const appointmentDate = new Date(data.date);
    const startOfHour = new Date(appointmentDate);
    startOfHour.setMinutes(0, 0, 0);
    const endOfHour = new Date(appointmentDate);
    endOfHour.setMinutes(59, 59, 999);

    const existingApt = await db.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        date: { gte: startOfHour, lte: endOfHour },
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      }
    });

    if (existingApt) {
      return {
        success: false,
        error: 'El horario seleccionado ya está ocupado. Por favor elige otra hora o fecha.'
      };
    }

    const appointment = await db.appointment.create({
      data: {
        patientId: profile.id,
        doctorId: data.doctorId,
        serviceId: data.serviceId,
        date: appointmentDate,
        createdById: user.id,
        clinicId: clinicId!,
        status: 'SCHEDULED',
        medicalRecord: data.notes ? {
          create: {
            patientId: profile.id,
            clinicId: clinicId!,
            notes: `[Motivo de Consulta - Paciente]: ${data.notes}`
          }
        } : undefined,
      }
    });

    revalidatePath('/patient/history');
    revalidateTag(`clinic-${clinicId}-appointments`);
    revalidateTag(`patient-${profile.id}`);

    // Notificar a Admins y Doctores (ONLY in this clinic)
    db.user.findMany({
      where: { clinicId: clinicId!, role: { in: ['ADMIN', 'DOCTOR'] } },
      select: { id: true }
    }).then(async staffMembers => {
      const formattedDate = new Date(data.date).toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Guatemala' });
      const formattedTime = new Date(data.date).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala' });
      const title = 'Nueva Cita Solicitada';
      const body = `Un paciente ha programado una cita para el ${formattedDate} a las ${formattedTime}`;
      const url = '/dashboard/appointments';

      if (staffMembers.length > 0) {
        await (db as any).appNotification.createMany({
          data: staffMembers.map(staff => ({
            userId: staff.id,
            clinicId: clinicId!,
            title,
            message: body,
            type: 'INFO',
            link: url
          }))
        });

        Promise.all(staffMembers.map(staff =>
          sendPushNotification(staff.id, { title, body, url })
        )).catch(err => console.error("Error pushing to staff:", err));
      }
    });

    return { success: true, id: appointment.id };
  } catch (error: any) {
    console.error('Error al crear cita:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Crea una nueva cita iniciada por el personal.
 * TENANT-SCOPED + RBAC.
 */
export async function createStaffAppointment(data: StaffAppointmentData) {
  const { db, user, clinicId } = await withTenant();
  requireRole(user.role, ['ADMIN', 'RECEPTIONIST', 'DOCTOR']);

  try {
    const appointmentDate = new Date(data.date);
    const startOfHour = new Date(appointmentDate);
    startOfHour.setMinutes(0, 0, 0);
    const endOfHour = new Date(appointmentDate);
    endOfHour.setMinutes(59, 59, 999);

    const existingApt = await db.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        date: { gte: startOfHour, lte: endOfHour },
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      }
    });

    if (existingApt) {
      return { success: false, error: 'El horario seleccionado ya está ocupado por otra cita.' };
    }

    const appointment = await db.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        serviceId: data.serviceId,
        date: appointmentDate,
        createdById: user.id,
        clinicId: clinicId!,
        status: 'SCHEDULED',
        medicalRecord: data.notes ? {
          create: {
            patientId: data.patientId,
            clinicId: clinicId!,
            notes: `[Nota de Recepción]: ${data.notes}`
          }
        } : undefined,
      }
    });

    revalidatePath('/dashboard/appointments');
    revalidateTag(`clinic-${clinicId}-appointments`);
    revalidateTag(`patient-${data.patientId}`);

    // Sync push notifications
    db.user.findMany({
      where: { clinicId: clinicId!, role: { in: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] }, id: { not: user.id } },
      select: { id: true }
    }).then(staff => {
      staff?.forEach(s => sendPushNotification(s.id, {
        title: 'Sync', body: 'REFRESH_APPOINTMENTS', url: '/dashboard/appointments'
      }));
    });

    return { success: true, id: appointment.id };
  } catch (error: any) {
    console.error('Error al crear cita (Staff):', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene las horas ya ocupadas para un doctor.
 * TENANT-SCOPED.
 */
export async function getOccupiedSlots(doctorId: string, date: string) {
  try {
    const { db } = await withTenant();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await db.appointment.findMany({
      where: {
        doctorId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      },
      select: { date: true }
    });

    return appointments.map(apt => {
      const d = new Date(apt.date);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    });
  } catch (error) {
    console.error('Error fetching occupied slots:', error);
    return [];
  }
}

/**
 * Obtiene los servicios activos.
 * TENANT-SCOPED.
 */
export async function getActiveServices() {
  const { db } = await withTenant();

  try {
    const services = await db.service.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
    return services.map(s => ({ ...s, price: Number(s.price) }));
  } catch (error) {
    return [];
  }
}

/**
 * Obtiene los doctores disponibles.
 * TENANT-SCOPED.
 */
export async function getAvailableDoctors() {
  const { db } = await withTenant();

  try {
    return await db.doctorProfile.findMany({
      include: { user: { select: { name: true } } }
    });
  } catch (error) {
    return [];
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') {
  const { db, user, clinicId } = await withTenant();

  try {
    const apt = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: { select: { id: true, name: true } } } },
        service: { select: { name: true } },
        createdBy: { select: { role: true } }
      }
    });

    if (!apt) throw new Error('Cita no encontrada');

    const isPatientAction = user.role === 'PATIENT';
    const isCreatedByStaff = apt.createdBy.role === 'ADMIN' || apt.createdBy.role === 'DOCTOR' || apt.createdBy.role === 'RECEPTIONIST';

    if (status === 'CONFIRMED' && isPatientAction && !isCreatedByStaff) {
      return { success: false, error: 'Solo el personal clínico puede confirmar citas programadas por pacientes.' };
    }

    await db.appointment.update({
      where: { id: appointmentId },
      data: { status }
    });

    if (status === 'CONFIRMED' && !isPatientAction && apt.patient?.user?.name) {
      const formattedDate = new Date(apt.date).toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' });
      const formattedTime = new Date(apt.date).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
      await createAdminSystemNotification({
        title: 'Cita Confirmada',
        message: `El paciente ${apt.patient.user.name} ha confirmado su cita para el ${formattedDate} a las ${formattedTime}.`,
        type: 'SUCCESS',
        link: '/dashboard/appointments'
      });
    }

    if (!isPatientAction && apt.patient?.user?.id) {
      const formattedDate = new Date(apt.date).toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Guatemala' });
      const formattedTime = new Date(apt.date).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala' });
      const title = status === 'CONFIRMED' ? 'Cita Confirmada ✅' : 'Cita Cancelada ❌';
      const message = status === 'CONFIRMED'
        ? `Tu cita para ${apt.service.name} el ${formattedDate} a las ${formattedTime} ha sido confirmada.`
        : `Tu cita para ${apt.service.name} el ${formattedDate} a las ${formattedTime} ha sido cancelada por la clínica.`;

      const { createPatientNotification } = await import('./app-notifications');
      await createPatientNotification({
        patientUserId: apt.patient.user.id,
        title,
        message,
        type: status === 'CONFIRMED' ? 'SUCCESS' : 'ERROR',
        link: '/patient/history'
      });
    }

    // Sync push to staff
    db.user.findMany({
      where: { role: { in: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] }, id: { not: user.id } },
      select: { id: true }
    }).then(staff => {
      staff.forEach(s => sendPushNotification(s.id, {
        title: 'Sync', body: 'REFRESH_APPOINTMENTS', url: '/dashboard/appointments'
      }));
    });

    revalidatePath('/dashboard/appointments');
    revalidatePath(`/dashboard/patients/${apt.patient.id}`);
    revalidatePath('/patient/history');
    revalidateTag(`clinic-${clinicId}-appointments`);
    revalidateTag(`patient-${apt.patient.id}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false };
  }
}

/**
 * Obtiene todas las citas de la clínica.
 * TENANT-SCOPED.
 */
export async function getAllAppointments() {
  const { db } = await withTenant();

  try {
    const appointments = await db.appointment.findMany({
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        service: true,
      },
      orderBy: { date: 'desc' }
    });

    return appointments.map(apt => ({
      ...apt,
      service: { ...apt.service, price: Number(apt.service.price) }
    }));
  } catch (error) {
    console.error('Error al obtener todas las citas:', error);
    return [];
  }
}

/**
 * Soft-delete de cita.
 * TENANT-SCOPED + RBAC.
 */
export async function deleteAppointment(id: string) {
  const { db, user, clinicId } = await withTenant();
  requireRole(user.role, ['ADMIN', 'RECEPTIONIST', 'DOCTOR']);

  try {
    const apt = await db.appointment.findUnique({ where: { id } });
    if (!apt) throw new Error('Cita no encontrada');

    // Soft delete via tenant middleware
    await db.appointment.delete({ where: { id } });

    // Sync push
    db.user.findMany({
      where: { clinicId: clinicId!, role: { in: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] }, id: { not: user.id } },
      select: { id: true }
    }).then(staff => {
      staff.forEach(s => sendPushNotification(s.id, {
        title: 'Sync', body: 'REFRESH_APPOINTMENTS', url: '/dashboard/appointments'
      }));
    });

    revalidatePath('/dashboard/appointments');
    revalidatePath(`/dashboard/patients/${apt.patientId}`);
    revalidatePath('/patient');
    revalidatePath('/patient/history');
    revalidateTag(`clinic-${clinicId}-appointments`);
    revalidateTag(`patient-${apt.patientId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return { success: false };
  }
}

/**
 * Actualiza una cita existente.
 * TENANT-SCOPED + RBAC.
 */
export async function updateAppointment(id: string, data: StaffAppointmentData) {
  const { db, user, clinicId } = await withTenant();
  requireRole(user.role, ['ADMIN', 'RECEPTIONIST', 'DOCTOR']);

  try {
    const appointmentDate = new Date(data.date);
    const startOfHour = new Date(appointmentDate);
    startOfHour.setMinutes(0, 0, 0);
    const endOfHour = new Date(appointmentDate);
    endOfHour.setMinutes(59, 59, 999);

    const existingApt = await db.appointment.findFirst({
      where: {
        id: { not: id },
        doctorId: data.doctorId,
        date: { gte: startOfHour, lte: endOfHour },
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      }
    });

    if (existingApt) {
      return { success: false, error: 'El nuevo horario seleccionado ya está ocupado.' };
    }

    await db.appointment.update({
      where: { id },
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        serviceId: data.serviceId,
        date: appointmentDate,
        medicalRecord: data.notes ? {
          upsert: {
            create: {
              patientId: data.patientId,
              clinicId: clinicId!,
              notes: `[Nota de Recepción - Actualizada]: ${data.notes}`
            },
            update: { notes: `[Nota de Recepción - Actualizada]: ${data.notes}` }
          }
        } : undefined
      }
    });

    revalidatePath('/dashboard/appointments');
    revalidatePath('/patient/history');
    revalidateTag(`clinic-${clinicId}-appointments`);
    revalidateTag(`patient-${data.patientId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return { success: false, error: error.message };
  }
}
