'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Generates concentric circles paths for the "vortex" topo look
// Moved outside to avoid re-creation on every render
const numRings = 15; // Reduced from 40 to 15 for better performance
const radius = 800;

const RINGS_JSX = Array.from({ length: numRings }).map((_, i) => {
    const r = radius * (1 - Math.pow(i / numRings, 1.5)); // Non-linear spacing for depth
    if (r <= 0) return null;
    return (
        <circle
            key={i}
            cx="50%"
            cy="50%"
            r={r}
            fill="none"
            strokeWidth={0.5 + (i / numRings) * 1.5}
            vectorEffect="non-scaling-stroke"
        />
    );
}).filter(Boolean);

export default function TopologyBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    // Animate scale to simulate diving into the vortex as you scroll down
    const scale = useTransform(scrollYProgress, [0, 1], [1, 2.5]); // Slightly reduced scale range
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 10]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [0.6, 0.2]);

    return (
        <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-white flex bg-noise">
            <motion.div
                style={{ scale, rotate, opacity }}
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-1000"
            >
                {/* Simplified SVG structure */}
                <svg
                    className="absolute w-[150vw] h-[150vh] min-w-[800px] min-h-[800px] opacity-20"
                    viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                >
                    <g stroke="currentColor" className="text-brand-500/10">{RINGS_JSX}</g>
                </svg>

                <svg
                    className="absolute w-[150vw] h-[150vh] min-w-[800px] min-h-[800px] opacity-30"
                    viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                >
                    <g stroke="currentColor" className="text-brand-600/5">{RINGS_JSX}</g>
                </svg>
            </motion.div>

            {/* Gradient Overlay to fade edges into background color */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#FFFFFF_85%)]" />
        </div>
    );
}
