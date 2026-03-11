import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTenantPrisma } from '../lib/prisma-tenant';

const mockBasePrisma = {
    patientProfile: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    securityAuditLog: {
        create: vi.fn(),
    },
    $extends: vi.fn().mockImplementation((extension) => {
        return {
            patientProfile: {
                findMany: (args: any) => extension.query.$allModels.findMany({
                    model: 'patientProfile', args, query: mockBasePrisma.patientProfile.findMany
                }),
                update: (args: any) => extension.query.$allModels.update({
                    model: 'patientProfile', args, query: mockBasePrisma.patientProfile.update
                }),
                delete: (args: any) => extension.query.$allModels.delete({
                    model: 'patientProfile', args, query: mockBasePrisma.patientProfile.delete
                }),
            }
        };
    })
} as any;

describe('Tenant Isolation', () => {
    it('should catch cross-tenant violation', async () => {
        const db = createTenantPrisma(mockBasePrisma, { clinicId: 'A', userId: 'U', userRole: 'D' });
        mockBasePrisma.patientProfile.update.mockResolvedValue({ id: 'p', clinicId: 'B' });

        let error;
        try {
            await db.patientProfile.update({ where: { id: 'p' }, data: { phone: '12345678' } });
        } catch (e: any) {
            error = e;
        }

        expect(error).toBeDefined();
        expect(error.message).toContain('Acceso denegado');
    });

    it('should filter correctly', async () => {
        const db = createTenantPrisma(mockBasePrisma, { clinicId: 'A', userId: 'U', userRole: 'D' });
        await db.patientProfile.findMany({ where: {} });
        expect(mockBasePrisma.patientProfile.findMany).toHaveBeenCalledWith({
            where: { clinicId: 'A', deletedAt: null }
        });
    });
});
