'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// ... existing PayBI logic ...

/**
 * Obtiene todas las facturas y pagos realizados.
 */
export async function getPayments() {
  const session = await auth();
  const clinicId = (session?.user as any)?.clinicId;
  if (!clinicId) throw new Error('No autorizado');

  try {
    const bills = await prisma.invoice.findMany({
      where: { clinicId: clinicId },
      include: {
        transactions: true,
        appointment: {
          include: {
            patient: {
              include: {
                user: { select: { name: true } }
              }
            },
            doctor: {
              include: {
                user: { select: { name: true } }
              }
            },
            service: { select: { name: true, price: true } }
          }
        }
      } as any, // Bypass TS cache for 'transactions'
      orderBy: { createdAt: 'desc' }
    });
    return (bills as any[]).map(bill => ({
      ...bill,
      totalAmount: Number(bill.totalAmount),
      appointment: {
        ...bill.appointment,
        service: bill.appointment?.service ? {
          ...bill.appointment.service,
          price: Number(bill.appointment.service.price)
        } : null
      }
    }));
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    return [];
  }
}
