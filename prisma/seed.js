const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 starting robust seeding for multi-tenant pediatric saas...\n');

    // 1. CLEANUP (Optional - but recommended for a clean start)
    // Be careful with delete order due to foreign keys
    await prisma.user.deleteMany({});
    await prisma.clinic.deleteMany({});
    await prisma.subscriptionPlan.deleteMany({});
    console.log('🗑️  cleaned up existing users, clinics, and plans.');

    // 2. SUBSCRIPTION PLANS
    const plans = await Promise.all([
        prisma.subscriptionPlan.create({
            data: {
                name: 'Starter',
                price: 299.00,
                maxPatients: 100,
                maxDoctors: 1,
                features: ['Expediente Básico', 'Agenda Web']
            }
        }),
        prisma.subscriptionPlan.create({
            data: {
                name: 'Pro',
                price: 599.00,
                maxPatients: 1000,
                maxDoctors: 5,
                features: ['Expediente Completo', 'Analíticas', 'WhatsApp Bot']
            }
        }),
        prisma.subscriptionPlan.create({
            data: {
                name: 'Enterprise',
                price: 1200.00,
                maxPatients: null,
                maxDoctors: null,
                features: ['Todo Ilimitado', 'Soporte 24/7', 'Personalización']
            }
        })
    ]);
    console.log(`✅ ${plans.length} subscription plans created.`);

    const starterPlanId = plans[0].id;

    // 3. CLINICS (TENANTS)
    // System Clinic for Super Admins
    const systemClinic = await prisma.clinic.create({
        data: {
            name: 'Administración Global SaaS',
            slug: 'admin',
            subscriptionStatus: 'ACTIVE',
        }
    });

    // Demo Clinic for local administration
    const demoClinic = await prisma.clinic.create({
        data: {
            name: 'Clínica Pediátrica San Lucas',
            slug: 'san-lucas',
            planId: starterPlanId,
            subscriptionStatus: 'ACTIVE',
        }
    });
    console.log(`✅ 2 Clinics created (admin and san-lucas).`);

    // 4. USERS
    const salt = 10;

    // SaaS Super Admin
    await prisma.user.create({
        data: {
            email: 'jawide03@gmail.com',
            name: 'SaaS Super Admin',
            password: bcrypt.hashSync('ClinicaPediatrica2026!', salt),
            role: 'SUPER_ADMIN',
            clinicId: systemClinic.id
        }
    });

    // Clinic Admin
    await prisma.user.create({
        data: {
            email: 'clinic-admin@demo.gt',
            name: 'Admin Demostración',
            password: bcrypt.hashSync('Demo123!', salt),
            role: 'ADMIN',
            clinicId: demoClinic.id
        }
    });

    // Demo Patients
    await prisma.user.create({
        data: {
            email: 'sofia.madre@demo.gt',
            name: 'Sofía María López',
            password: bcrypt.hashSync('Demo123!', salt),
            role: 'PATIENT',
            clinicId: demoClinic.id
        }
    });

    await prisma.user.create({
        data: {
            email: 'diego.padre@demo.gt',
            name: 'Diego Alberto Ramírez',
            password: bcrypt.hashSync('Demo123!', salt),
            role: 'PATIENT',
            clinicId: demoClinic.id
        }
    });

    console.log('\n🎉 Seed completed successfully!');
    console.log('📋 Credenciales activas:');
    console.log('- Super Admin: jawide03@gmail.com / ClinicaPediatrica2026!');
    console.log('- Clinic Admin: clinic-admin@demo.gt / Demo123!');
    console.log('- Patients: sofia.madre@demo.gt / Diego Alberto (Demo123!)');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
