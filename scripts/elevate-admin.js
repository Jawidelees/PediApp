const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- SaaS Platform Elevation Script ---');

    // 1. Create Initial Subscription Plans
    const plans = [
        { name: 'Lite', price: 29.99, maxPatients: 500, maxDoctors: 2, features: ['Expediente Básico', 'Citas Online', 'Soporte Email'] },
        { name: 'Pro', price: 79.99, maxPatients: 2000, maxDoctors: 10, features: ['Expediente Avanzado', 'Analíticas', 'Facturación FEL', 'Push Notifications'] },
        { name: 'Enterprise', price: 199.99, maxPatients: null, maxDoctors: null, features: ['Todo el sistema', 'Soporte 24/7', 'API Access', 'Custom Subdomain'] },
    ];

    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { id: plan.name.toLowerCase() },
            update: plan,
            create: { ...plan, id: plan.name.toLowerCase() },
        });
        console.log(`Plan ${plan.name} created/updated.`);
    }

    // 2. Elevate User jawide03@gmail.com to SUPER_ADMIN
    const hashedPassword = await require('bcryptjs').hash('ClinicaPediatrica2026!', 10);
    const user = await prisma.user.upsert({
        where: { email: 'jawide03@gmail.com' },
        update: {
            role: 'SUPER_ADMIN',
            clinicId: null
        },
        create: {
            email: 'jawide03@gmail.com',
            name: 'Super Admin',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            clinicId: null
        }
    });

    console.log(`SUCCESS: User ${user.email} is now SUPER_ADMIN.`);
    console.log('--- Elevation Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
