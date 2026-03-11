import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx — the standard cn() utility.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a number as Guatemalan Quetzales (GTQ).
 * @example formatCurrency(125.50) → "Q125.50"
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ',
        minimumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format a Date in Guatemalan Spanish locale.
 * @example formatDate(new Date()) → "martes, 19 de febrero de 2026"
 */
export function formatDate(
    date: Date | string,
    options?: Intl.DateTimeFormatOptions,
): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-GT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
    });
}

/**
 * Format a Date as short time string.
 * @example formatTime(new Date()) → "10:30 AM"
 */
export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('es-GT', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Get initials from a full name.
 * @example getInitials("Ana Gómez") → "AG"
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Calculate age based on birth date.
 */
export function calculateAge(birthDate: Date | string | null): number | null {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

/**
 * Delay execution (for loading states, etc).
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
