'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BentoCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    hoverScale?: boolean;
}

export function BentoCard({ children, className, delay = 0, hoverScale = true }: BentoCardProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={hoverScale ? { y: -4, transition: { duration: 0.25 } } : {}}
            className={cn(
                // Neobrutalista base: thick borders, rounded-3xl, shadow-2xl
                'relative overflow-hidden rounded-3xl border-2 border-white/10',
                'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
                'backdrop-blur-xl shadow-2xl',
                'transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(14,165,233,0.12)]',
                'hover:border-brand-500/30',
                className
            )}
        >
            {children}
        </motion.div>
    );
}

interface BentoGridProps {
    children: React.ReactNode;
    className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
    return (
        <div
            className={cn(
                'grid gap-4 md:gap-5',
                // Bento grid: irregular layout with auto-rows
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-12',
                'auto-rows-[minmax(200px,auto)]',
                className
            )}
        >
            {children}
        </div>
    );
}
