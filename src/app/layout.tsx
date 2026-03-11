/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
    title: {
        template: '%s | Clínica Pediátrica',
        default: 'Clínica Pediátrica',
    },
    description: 'Sistema de Gestión de Clínica Pediátrica',
    keywords: [
        'clínica',
        'pediatría',
        'gestión médica',
        'citas',
        'vacunas',
        'crecimiento',
        'Guatemala',
        'PWA',
    ],
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Clínica Pediátrica',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#4fc3f7' },
        { media: '(prefers-color-scheme: dark)', color: '#1a2332' },
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <link key="fonts-preconnect" rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    key="fonts-gstatic"
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..0&display=block" />
                <link key="apple-icon" rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            </head>
            <body className="min-h-screen bg-background font-sans antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
