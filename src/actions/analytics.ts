'use server';

import { withTenant, requireRole } from '@/lib/with-tenant';

/**
 * Obtiene analíticas clínicas completas.
 * TENANT-SCOPED + RBAC (solo Admin/Doctor).
 */
export async function getClinicalAnalytics() {
    const { db, user, clinicId } = await withTenant();
    requireRole(user.role, ['ADMIN', 'DOCTOR']);

    try {
        // 1. Ingresos por Servicio
        const completedInvoices = await db.invoice.findMany({
            where: { status: 'COMPLETED' },
            include: { appointment: { include: { service: true } } }
        });

        const revenueByService = completedInvoices.reduce((acc: any, inv: any) => {
            const serviceName = inv.appointment?.service?.name || 'Otros Servicios';
            const amount = Number(inv.totalAmount);
            acc[serviceName] = (acc[serviceName] || 0) + amount;
            return acc;
        }, {});

        // 2. Productividad por Doctor
        const doctorStats = await db.appointment.groupBy({
            by: ['doctorId'],
            where: { status: 'COMPLETED' },
            _count: { id: true }
        });

        const doctors = await db.doctorProfile.findMany({
            where: { id: { in: doctorStats.map(d => d.doctorId) } },
            include: { user: { select: { name: true } } }
        });

        const productivityByDoctor = doctorStats.map(stat => ({
            name: doctors.find(d => d.id === stat.doctorId)?.user?.name || 'Desconocido',
            count: stat._count?.id || 0
        }));

        // 3. Ingresos Diarios (Últimos 7 días)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyRevenue = await db.invoice.findMany({
            where: { status: 'COMPLETED', createdAt: { gte: sevenDaysAgo } },
            select: { totalAmount: true, createdAt: true }
        });

        // Today's revenue
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todayRevenueAgg = await db.invoice.aggregate({
            where: { status: 'COMPLETED', createdAt: { gte: startOfToday } },
            _sum: { totalAmount: true }
        });

        const totalRevenueToday = Number(todayRevenueAgg?._sum?.totalAmount || 0);

        // 4. Métricas de Recuperación
        const records = await db.medicalRecord.findMany({
            select: { painMap: true, patientId: true, createdAt: true }
        });

        const patientEvolution: any = {};
        records.forEach((rec: any) => {
            if (!patientEvolution[rec.patientId]) patientEvolution[rec.patientId] = [];
            const points = rec.painMap as any[];
            if (points && Array.isArray(points) && points.length > 0) {
                const avgIntensity = points.reduce((sum, p) => sum + p.intensity, 0) / points.length;
                patientEvolution[rec.patientId].push({ date: rec.createdAt, intensity: avgIntensity });
            }
        });

        let totalReduction = 0;
        let countedPatients = 0;

        Object.values(patientEvolution).forEach((ev: any) => {
            if (ev.length >= 2) {
                const first = ev[0].intensity;
                const last = ev[ev.length - 1].intensity;
                totalReduction += (first - last);
                countedPatients++;
            }
        });

        const avgRecoveryRate = countedPatients > 0 ? (totalReduction / countedPatients).toFixed(1) : 0;

        // Use raw prisma for counts that don't have clinicId on PatientProfile user relation query
        const totalPatients = await db.patientProfile.count();
        const totalInvoices = await db.invoice.count();
        const pendingAgg = await db.invoice.aggregate({
            where: { status: 'PENDING' },
            _sum: { totalAmount: true }
        });

        return {
            revenueByService,
            productivityByDoctor,
            dailyRevenue: dailyRevenue.map(r => ({ date: r.createdAt, amount: Number(r.totalAmount) })),
            totalRevenueToday,
            avgRecoveryRate: Number(avgRecoveryRate),
            totalInvoices,
            totalPatients,
            pendingRevenue: {
                _sum: { totalAmount: Number(pendingAgg?._sum?.totalAmount || 0) }
            }
        };
    } catch (error) {
        console.error('Error in analytics:', error);
        throw error;
    }
}
