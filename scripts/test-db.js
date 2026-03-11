const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function test() {
    console.log('Testing connection to:', process.env.DATABASE_URL);
    const prisma = new PrismaClient();
    try {
        const count = await prisma.user.count();
        console.log('User count:', count);
        const users = await prisma.user.findMany({ select: { email: true, role: true } });
        console.log('Users:', users);
    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
