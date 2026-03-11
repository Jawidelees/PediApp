'use client';

import React from 'react';
import MobileNav from '@/components/layout/MobileNav';
import { InstallPWA } from '@/components/pwa/InstallPWA';

export default function DashboardClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display">
            {/* 
                We use a max-w-md container to simulate the mobile-first PWA feel of Stitch
                even on desktop, centering the content.
            */}
            <div className="mx-auto w-full max-w-md bg-white dark:bg-background-dark min-h-screen shadow-xl relative flex flex-col">
                {/* Page content */}
                <main className="flex-1 flex flex-col relative">
                    {children}
                </main>

                {/* Bottom Navigation Bar (Stitch style) */}
                <MobileNav />
            </div>

            <InstallPWA />
        </div>
    );
}
