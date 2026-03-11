import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// In-memory rate limiting to prevent brute force attacks
const rateLimitMap = new Map<string, { count: number, lockUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 5 * 60 * 1000; // 5 minutes

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const identifier = credentials.email as string;
                const password = credentials.password as string;

                // Rate limiting check
                const record = rateLimitMap.get(identifier) || { count: 0, lockUntil: 0 };
                if (record.lockUntil > Date.now()) {
                    throw new Error('Demasiados intentos. Por favor intenta en 5 minutos.');
                }

                try {
                    const user = await prisma.user.findFirst({
                        where: {
                            OR: [
                                { email: identifier },
                                { username: identifier }
                            ]
                        },
                        include: {
                            clinic: true
                        }
                    });

                    if (!user) {
                        record.count++;
                        if (record.count >= MAX_ATTEMPTS) record.lockUntil = Date.now() + LOCK_TIME;
                        rateLimitMap.set(identifier, record);
                        return null;
                    }

                    // Secure password verification
                    const isValid = bcrypt.compareSync(password, user.password);

                    if (!isValid) {
                        record.count++;
                        if (record.count >= MAX_ATTEMPTS) record.lockUntil = Date.now() + LOCK_TIME;
                        rateLimitMap.set(identifier, record);
                        return null;
                    }

                    // Success - reset rate limit
                    rateLimitMap.delete(identifier);

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        clinicId: user.clinicId,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // Include role and clinicId for social logins.
            // If it's a new user via Google, user will exist but might not have a clinicId depending on your logic.
            // For now, we trust the DB record if it exists.
            if (user) {
                token.role = (user as any).role || 'PATIENT';
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.clinicId = (user as any).clinicId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).clinicId = token.clinicId;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
            }
            return session;
        },
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const role = (auth?.user as any)?.role;

            const isDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isPatientArea = nextUrl.pathname.startsWith('/patient');
            const isAuthPage =
                nextUrl.pathname.startsWith('/login') ||
                nextUrl.pathname.startsWith('/register');

            // Redirect logged-in users away from auth pages
            if (isAuthPage && isLoggedIn) {
                if (role === 'PATIENT') {
                    return Response.redirect(new URL('/patient', nextUrl));
                }
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            // Protect dashboard routes
            if (isDashboard) {
                if (!isLoggedIn) {
                    return Response.redirect(new URL('/login', nextUrl));
                }
                if (role === 'SUPER_ADMIN') {
                    return Response.redirect(new URL('/app-admin', nextUrl));
                }
                if (role === 'PATIENT') {
                    return Response.redirect(new URL('/patient', nextUrl));
                }
                return true;
            }

            // Protect app-admin routes
            if (nextUrl.pathname.startsWith('/app-admin')) {
                if (!isLoggedIn) {
                    return Response.redirect(new URL('/login', nextUrl));
                }
                if (role !== 'SUPER_ADMIN') {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
                return true;
            }

            // Protect patient routes
            if (isPatientArea) {
                if (!isLoggedIn) {
                    return Response.redirect(new URL('/login', nextUrl));
                }
                return true;
            }

            return true;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },
});
