import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // Define allowed domains (including development)
    const allowedDomains = ['localhost:3000', 'clinica-pediatrica.com']; // Update with production domain

    // Extract subdomain
    let subdomain = '';
    if (hostname.includes('localhost:3000')) {
        subdomain = hostname.replace('.localhost:3000', '');
        if (subdomain === 'localhost:3000') subdomain = '';
    } else {
        // Production logic
        const parts = hostname.split('.');
        if (parts.length > 2) {
            subdomain = parts[0];
        }
    }

    // Security Headers (HIPAA / Medical Grade)
    const response = NextResponse.next();

    // === SECURITY HEADERS ===
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    );
    // CSP - Content Security Policy
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requiere unsafe-eval en dev
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https:",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
            "frame-ancestors 'none'",
        ].join('; ')
    );

    // Tenant context header
    if (subdomain && subdomain !== 'www') {
        response.headers.set('x-clinic-slug', subdomain);
    }

    const isLoggedIn = !!req.auth;
    const role = (req.auth?.user as any)?.role;
    const userClinicId = (req.auth?.user as any)?.clinicId;

    const isAuthRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/register');
    const isStaffRoute = url.pathname.startsWith('/dashboard');
    const isPatientRoute = url.pathname.startsWith('/patient');
    const isAppAdminRoute = url.pathname.startsWith('/app-admin');
    const isApiRoute = url.pathname.startsWith('/api');

    // 0. Skip API routes (handled by their own auth)
    if (isApiRoute) return response;

    // 1. Unauthenticated users trying to access protected routes
    if (!isLoggedIn && (isStaffRoute || isPatientRoute || isAppAdminRoute)) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // 2. Authenticated users trying to access auth routes (e.g. going back to /login)
    if (isLoggedIn && isAuthRoute) {
        if (role === 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/app-admin', req.url));
        }
        if (role === 'PATIENT') {
            return NextResponse.redirect(new URL('/patient/dashboard_para_padres', req.url));
        } else {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }

    // 3. Role-Based Access Control (RBAC) & URL Segregation
    if (isLoggedIn) {
        // Super Admin Segregation
        if (role === 'SUPER_ADMIN' && !isAppAdminRoute) {
            if (isStaffRoute || isPatientRoute) {
                return NextResponse.redirect(new URL('/app-admin', req.url));
            }
        }

        // Prevent non-superadmins from accessing platform admin
        if (role !== 'SUPER_ADMIN' && isAppAdminRoute) {
            return NextResponse.redirect(new URL(role === 'PATIENT' ? '/patient/dashboard_para_padres' : '/dashboard', req.url));
        }

        // Patient Segregation
        if (role === 'PATIENT' && isStaffRoute) {
            return NextResponse.redirect(new URL('/patient/dashboard_para_padres', req.url));
        }

        // Staff Segregation from Patient Portal
        if (role !== 'PATIENT' && role !== 'SUPER_ADMIN' && isPatientRoute) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // 4. Intra-Staff Segregation (HIPAA & Operational Compliance)
        if (isStaffRoute && role !== 'SUPER_ADMIN') {
            const isSettingsRoute = url.pathname.startsWith('/dashboard/settings');
            const isBillingRoute = url.pathname.startsWith('/dashboard/billing');
            const isInventoryRoute = url.pathname.startsWith('/dashboard/inventory');
            const isAuditRoute = url.pathname.startsWith('/dashboard/audit');

            if (isSettingsRoute && role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
            if (isBillingRoute && role === 'DOCTOR') {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
            if (isInventoryRoute && role === 'RECEPTIONIST') {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
            // Audit logs solo para ADMIN
            if (isAuditRoute && role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
        }

        // 5. Subdomain-Clinic Validation
        // Ensure user's clinicId matches the subdomain they're accessing
        if (subdomain && subdomain !== 'www' && userClinicId) {
            // This header allows server components to validate tenant context
            response.headers.set('x-user-clinic-id', userClinicId);
        }
    }

    return response;
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public assets
         */
        '/((?!api|_next/static|_next/image|favicon.ico|assets|manifest.json|sw.js|icons).*)',
    ],
};
