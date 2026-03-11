import prisma from '@/lib/prisma';

export async function getClinicBySlug(slug: string) {
    if (!slug) return null;
    return await prisma.clinic.findUnique({
        where: { slug },
    });
}
