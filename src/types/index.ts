// ═══════════════════════════════════════════════
// Clínica Pediátrica — Global Type Definitions
// Mirrors Prisma schema + UI-specific types
// ═══════════════════════════════════════════════

// ── Roles ──────────────────────────────────────

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT';

// ── User & Profiles ────────────────────────────

export interface User {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}

export interface DoctorProfile {
    id: string;
    userId: string;
    specialty: string;
    license: string | null;
}

export interface PatientProfile {
    id: string;
    userId: string;
    phone: string | null;
    address: string | null;
    nit: string | null;
    birthDate: Date | null;
}

// ── Services ───────────────────────────────────

export interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration: number; // minutes
    active: boolean;
}

// ── Appointments ───────────────────────────────

export type AppointmentStatus =
    | 'SCHEDULED'
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';

export interface Appointment {
    id: string;
    date: Date;
    status: AppointmentStatus;
    patientId: string;
    doctorId: string;
    serviceId: string;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AppointmentWithRelations extends Appointment {
    patient: PatientProfile & { user: User };
    doctor: DoctorProfile & { user: User };
    service: Service;
}

// ── Inventory ──────────────────────────────────

export interface InventoryItem {
    id: string;
    name: string;
    sku: string | null;
    description: string | null;
    stock: number;
    minStock: number;
    unitPrice: number;
    costPrice: number;
    updatedAt: Date;
}

export type StockStatus = 'ok' | 'low' | 'critical';

export interface InventoryItemWithStatus extends InventoryItem {
    status: StockStatus;
}

// ── Invoices & Payments ────────────────────────

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Invoice {
    id: string;
    appointmentId: string;
    totalAmount: number;
    felUuid: string | null;
    felSeries: string | null;
    felNumber: string | null;
    felJson: Record<string, unknown> | null;
    status: PaymentStatus;
    paymentMethod: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// ── Medical Records ────────────────────────────

export interface MedicalRecord {
    id: string;
    appointmentId: string;
    patientId: string;
    diagnosis: string | null;
    notes: string | null;
    prescription: string | null;
    aiAdvice: string | null;
    photos: string[];
    createdAt: Date;
    updatedAt: Date;
}

// ── UI Types ───────────────────────────────────

export interface NavItem {
    label: string;
    href: string;
    icon: string;
    roles: Role[];
    badge?: number;
}

export interface DashboardMetrics {
    totalIncome: number;
    appointmentsToday: number;
    activePatients: number;
    lowStockCount: number;
}

export interface ActionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}
