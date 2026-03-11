'use client';

import React from 'react';
import PatientMobileNav from '@/components/layout/PatientMobileNav';
import { InstallPWA } from '@/components/pwa/InstallPWA';

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased min-h-[100dvh]">
            <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-xl overflow-x-hidden pb-20">
                {/* The Mobile Navigation serves as the main navigation for the Parent App */}
                <PatientMobileNav />

                {/* Main Content Area */}
                <div className="flex-1 w-full">
                    {children}
                </div>

                <InstallPWA />
            </div>
        </div>
    );
}
