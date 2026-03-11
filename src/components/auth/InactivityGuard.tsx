'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos
const WARNING_BEFORE = 2 * 60 * 1000; // Mostrar advertencia 2 min antes

interface InactivityGuardProps {
    children: React.ReactNode;
}

/**
 * HOC que envuelve la aplicación para detectar inactividad y cerrar sesión automáticamente.
 * Cumple requisitos HIPAA de cierre de sesión por inactividad.
 * 
 * - Trackea mouse, teclado, scroll y touch
 * - Muestra modal de advertencia 2 minutos antes del cierre
 * - Cierra sesión después de 15 minutos de inactividad total
 */
export default function InactivityGuard({ children }: InactivityGuardProps) {
    const [showWarning, setShowWarning] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const warningRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const handleLogout = useCallback(async () => {
        try {
            await signOut({ callbackUrl: '/login?reason=inactivity' });
        } catch {
            window.location.href = '/login?reason=inactivity';
        }
    }, []);

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);

        // Clear existing timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);

        // Set warning timer (fires 2 min before logout)
        warningRef.current = setTimeout(() => {
            setShowWarning(true);
        }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

        // Set logout timer
        timeoutRef.current = setTimeout(() => {
            handleLogout();
        }, INACTIVITY_TIMEOUT);
    }, [handleLogout]);

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        // Throttle: only reset every 30 seconds to avoid excessive timer resets
        let lastReset = Date.now();
        const throttledReset = () => {
            if (Date.now() - lastReset > 30000) {
                lastReset = Date.now();
                resetTimer();
            }
        };

        events.forEach((event) => {
            document.addEventListener(event, throttledReset, { passive: true });
        });

        // Initial timer
        resetTimer();

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, throttledReset);
            });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);
        };
    }, [resetTimer]);

    return (
        <>
            {children}

            {/* Modal de advertencia de inactividad */}
            {showWarning && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    <div
                        style={{
                            background: 'var(--surface-primary, #1a1a2e)',
                            border: '1px solid var(--border-warning, #f59e0b)',
                            borderRadius: '16px',
                            padding: '32px',
                            maxWidth: '420px',
                            width: '90%',
                            textAlign: 'center',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
                        <h2
                            style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: 'var(--text-primary, #ffffff)',
                                marginBottom: '8px',
                            }}
                        >
                            Sesión por expirar
                        </h2>
                        <p
                            style={{
                                fontSize: '14px',
                                color: 'var(--text-secondary, #a0a0b0)',
                                marginBottom: '24px',
                                lineHeight: '1.5',
                            }}
                        >
                            Tu sesión se cerrará automáticamente en <strong style={{ color: '#f59e0b' }}>2 minutos</strong> por
                            inactividad. Mueve el mouse o presiona una tecla para mantenerla activa.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={resetTimer}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'var(--accent-primary, #6366f1)',
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                Continuar trabajando
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-default, #333)',
                                    background: 'transparent',
                                    color: 'var(--text-secondary, #a0a0b0)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
