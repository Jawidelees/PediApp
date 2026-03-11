// Demo seed data — lives entirely in memory. Zero DB interaction.

const today = new Date();
const d = (daysOffset: number, hour = 9, min = 0) => {
    const date = new Date(today);
    date.setDate(date.getDate() + daysOffset);
    date.setHours(hour, min, 0, 0);
    return date.toISOString();
};

export const DEMO_PATIENTS = [
    {
        id: 'demo-p1',
        phone: '5555-1234',
        address: 'Zona 1, Guatemala',
        nit: '1234567-8',
        birthDate: '2020-03-15',
        allergies: 'Penicilina',
        user: { name: 'Sofía María López', email: 'sofia.madre@demo.gt' },
        appointments: [
            {
                id: 'demo-apt-1', date: d(-2, 10), status: 'COMPLETED',
                service: { name: 'Control Niño Sano', price: 300 },
                doctor: { user: { name: 'Dr. Pedro Ramírez' } },
                invoice: { id: 'demo-inv-1', total: 300, status: 'PAID' }
            },
            {
                id: 'demo-apt-2', date: d(1, 14), status: 'SCHEDULED',
                service: { name: 'Vacunación', price: 150 },
                doctor: { user: { name: 'Dr. Pedro Ramírez' } },
                invoice: null
            },
            {
                id: 'demo-apt-3', date: d(7, 9), status: 'CONFIRMED',
                service: { name: 'Control de Crecimiento', price: 250 },
                doctor: { user: { name: 'Dr. Pedro Ramírez' } },
                invoice: null
            }
        ],
        growthRecords: [
            { date: d(-60), weight: 12.5, height: 85, headCircumference: 47 },
            { date: d(-2), weight: 13.2, height: 87, headCircumference: 47.5 },
        ],
        vaccinations: [
            { vaccineName: 'Triple Viral (SRP)', doseNumber: 1, appliedDate: d(-90), nextDoseDate: d(90) },
            { vaccineName: 'DPT', doseNumber: 3, appliedDate: d(-60), nextDoseDate: null },
        ],
        medicalRecords: [
            {
                id: 'demo-mr-1',
                diagnosis: 'Control de niño sano — desarrollo normal para la edad',
                prescription: 'Vitaminas pediátricas. Acetaminofén 120mg/5ml si presenta fiebre post-vacuna.',
                notes: 'Peso y talla dentro del percentil 50. Desarrollo psicomotor adecuado.',
                painMap: [],
                createdAt: d(-2)
            }
        ],
        treatmentPlans: [
            {
                id: 'demo-tp-1', name: 'Esquema de Vacunación Completo', totalPhases: 8, completedPhases: 5,
                description: 'Seguimiento del esquema nacional de vacunación. Próxima: refuerzo SRP.',
                createdAt: d(-365), updatedAt: d(-2)
            }
        ]
    },
    {
        id: 'demo-p2',
        phone: '4567-8901',
        address: 'Zona 10, Guatemala',
        nit: 'CF',
        birthDate: '2019-07-22',
        allergies: 'Ninguna conocida',
        user: { name: 'Diego Alberto Ramírez', email: 'diego.padre@demo.gt' },
        appointments: [
            {
                id: 'demo-apt-4', date: d(-7, 11), status: 'COMPLETED',
                service: { name: 'Consulta Pediátrica General', price: 350 },
                doctor: { user: { name: 'Dr. Pedro Ramírez' } },
                invoice: { id: 'demo-inv-2', total: 350, status: 'PAID' }
            },
            {
                id: 'demo-apt-5', date: d(0, 15), status: 'SCHEDULED',
                service: { name: 'Control Niño Sano', price: 300 },
                doctor: { user: { name: 'Dr. Pedro Ramírez' } },
                invoice: null
            }
        ],
        growthRecords: [
            { date: d(-30), weight: 15.8, height: 95, headCircumference: 49 },
        ],
        vaccinations: [
            { vaccineName: 'Influenza', doseNumber: 1, appliedDate: d(-30), nextDoseDate: d(150) },
        ],
        medicalRecords: [
            {
                id: 'demo-mr-2',
                diagnosis: 'Infección respiratoria alta leve',
                prescription: 'Amoxicilina 250mg/5ml cada 8h por 7 días. Abundantes líquidos.',
                notes: 'Paciente con tos y congestión nasal desde hace 3 días. Sin fiebre actualmente.',
                painMap: [],
                createdAt: d(-7)
            }
        ],
        treatmentPlans: [
            {
                id: 'demo-tp-2', name: 'Seguimiento Respiratorio', totalPhases: 3, completedPhases: 1,
                description: 'Control de infecciones respiratorias recurrentes y valoración de función pulmonar.',
                createdAt: d(-14), updatedAt: d(-7)
            }
        ]
    },
    {
        id: 'demo-p3',
        phone: '3456-7890',
        address: 'Zona 15, Guatemala',
        nit: '9876543-2',
        birthDate: '2023-11-05',
        allergies: 'Látex',
        user: { name: 'Valentina Castillo', email: 'valentina.madre@demo.gt' },
        appointments: [
            {
                id: 'demo-apt-6', date: d(2, 10, 30), status: 'CONFIRMED',
                service: { name: 'Vacunación', price: 150 },
                doctor: { user: { name: 'Dr. Pedro Ramírez' } },
                invoice: null
            }
        ],
        growthRecords: [
            { date: d(-15), weight: 6.8, height: 62, headCircumference: 40 },
        ],
        vaccinations: [
            { vaccineName: 'Pentavalente', doseNumber: 2, appliedDate: d(-30), nextDoseDate: d(2) },
        ],
        medicalRecords: [],
        treatmentPlans: []
    },
    {
        id: 'demo-p4',
        phone: '5678-1234',
        address: 'Zona 7, Guatemala',
        nit: 'CF',
        birthDate: '2018-01-30',
        allergies: 'Ninguna conocida',
        user: { name: 'Mateo José Méndez', email: 'mateo.padre@demo.gt' },
        appointments: [
            {
                id: 'demo-apt-7', date: d(-14, 9), status: 'COMPLETED',
                service: { name: 'Emergencia Pediátrica', price: 500 },
                doctor: { user: { name: 'Dr. Pedro Ramírez' } },
                invoice: { id: 'demo-inv-3', total: 500, status: 'PAID' }
            },
            {
                id: 'demo-apt-8', date: d(-1, 16), status: 'CANCELLED',
                service: { name: 'Control Niño Sano', price: 300 },
                doctor: { user: { name: 'Dr. Pedro Ramírez' } },
                invoice: null
            },
            {
                id: 'demo-apt-9', date: d(3, 11), status: 'SCHEDULED',
                service: { name: 'Control de Crecimiento', price: 250 },
                doctor: { user: { name: 'Dr. Pedro Ramírez' } },
                invoice: null
            }
        ],
        growthRecords: [
            { date: d(-60), weight: 20.1, height: 108, headCircumference: 51 },
            { date: d(-14), weight: 20.5, height: 109, headCircumference: 51 },
        ],
        vaccinations: [
            { vaccineName: 'Hepatitis A', doseNumber: 2, appliedDate: d(-60), nextDoseDate: null },
        ],
        medicalRecords: [
            {
                id: 'demo-mr-3',
                diagnosis: 'Gastroenteritis aguda — deshidratación leve',
                prescription: 'Sales de rehidratación oral. Dieta blanda. Probióticos.',
                notes: 'Paciente con diarrea y vómitos desde hace 2 días. Hidratación oral tolerada.',
                painMap: [],
                createdAt: d(-14)
            }
        ],
        treatmentPlans: [
            {
                id: 'demo-tp-3', name: 'Seguimiento Nutricional', totalPhases: 3, completedPhases: 1,
                description: 'Monitoreo de peso y nutrición tras episodio de gastroenteritis.',
                createdAt: d(-21), updatedAt: d(-14)
            }
        ]
    },
    {
        id: 'demo-p5',
        phone: '6789-0123',
        address: 'Zona 14, Guatemala',
        nit: '5432109-6',
        birthDate: '2021-09-12',
        allergies: 'Sulfonamidas',
        user: { name: 'Isabella Torres', email: 'isabella.madre@demo.gt' },
        appointments: [
            {
                id: 'demo-apt-10', date: d(0, 10), status: 'CONFIRMED',
                service: { name: 'Consulta Pediátrica General', price: 350 },
                doctor: { user: { name: 'Dr. Pedro Ramírez' } },
                invoice: { id: 'demo-inv-4', total: 350, status: 'PENDING' }
            },
            {
                id: 'demo-apt-11', date: d(5, 14), status: 'SCHEDULED',
                service: { name: 'Vacunación', price: 150 },
                doctor: { user: { name: 'Dr. Pedro Ramírez' } },
                invoice: null
            }
        ],
        growthRecords: [
            { date: d(-30), weight: 11.5, height: 82, headCircumference: 46 },
        ],
        vaccinations: [
            { vaccineName: 'Neumococo', doseNumber: 3, appliedDate: d(-90), nextDoseDate: d(5) },
        ],
        medicalRecords: [
            {
                id: 'demo-mr-4',
                diagnosis: 'Dermatitis atópica leve en pliegues',
                prescription: 'Crema hidratante sin fragancia. Corticoide tópico de baja potencia si hay brote.',
                notes: 'Piel seca en pliegues antecubitales. Se recomienda baño corto con agua tibia.',
                painMap: [],
                createdAt: d(-5)
            }
        ],
        treatmentPlans: [
            {
                id: 'demo-tp-4', name: 'Control Dermatológico', totalPhases: 4, completedPhases: 2,
                description: 'Seguimiento de dermatitis atópica con control de brotes y cuidado de piel.',
                createdAt: d(-30), updatedAt: d(-5)
            }
        ]
    },
];

// All appointments flattened for the calendar view
export const DEMO_ALL_APPOINTMENTS = DEMO_PATIENTS.flatMap(p =>
    p.appointments.map(apt => ({
        ...apt,
        patient: { user: { name: p.user.name } },
        patientId: p.id,
    }))
);

// Demo KPI Analytics
export const DEMO_ANALYTICS = {
    totalPatients: DEMO_PATIENTS.length,
    todayAppointments: DEMO_ALL_APPOINTMENTS.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate.toDateString() === today.toDateString();
    }).length,
    weekRevenue: 2100,
    monthRevenue: 8500,
    completedToday: DEMO_ALL_APPOINTMENTS.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate.toDateString() === today.toDateString() && a.status === 'COMPLETED';
    }).length,
    pendingPayments: 2,
    totalInvoices: 4,
};

// Demo Inventory
export const DEMO_INVENTORY = [
    { id: 'demo-i1', name: 'Acetaminofén Pediátrico 120mg/5ml', sku: 'INV-10101', stock: 15, minStock: 5, unitName: 'Frasco', baseUnitName: 'Dosis', price: 45, openPackageUnits: 0, unitsPerPackage: 1 },
    { id: 'demo-i2', name: 'Vacuna Pentavalente', sku: 'INV-20202', stock: 3, minStock: 10, unitName: 'Caja', baseUnitName: 'Dosis', price: 180, openPackageUnits: 5, unitsPerPackage: 10 },
    { id: 'demo-i3', name: 'Guantes de Nitrilo (S)', sku: 'INV-30303', stock: 45, minStock: 20, unitName: 'Caja', baseUnitName: 'Par', price: 85, openPackageUnits: 50, unitsPerPackage: 100 },
    { id: 'demo-i4', name: 'Sales de Rehidratación Oral', sku: 'INV-40404', stock: 20, minStock: 10, unitName: 'Caja', baseUnitName: 'Sobre', price: 15, openPackageUnits: 0, unitsPerPackage: 25 },
    { id: 'demo-i5', name: 'Amoxicilina Suspensión 250mg/5ml', sku: 'INV-50505', stock: 12, minStock: 5, unitName: 'Frasco', baseUnitName: 'Dosis', price: 35, openPackageUnits: 3, unitsPerPackage: 1 },
    { id: 'demo-i6', name: 'Jeringas Pediátricas 1ml', sku: 'INV-60606', stock: 1, minStock: 5, unitName: 'Caja', baseUnitName: 'Unidad', price: 120, openPackageUnits: 0, unitsPerPackage: 100 },
];
