export interface Milestone {
    ageMonths: number;
    title: string;
    description: string;
    items: string[];
}

export const pediatricMilestones: Milestone[] = [
    {
        ageMonths: 2,
        title: "Hitos - 2 Meses",
        description: "Su bebé empieza a sonreír y a seguir cosas con los ojos.",
        items: ["Sonrisa social", "Mantiene la cabeza erguida brevemente", "Gorjeos y sonidos vocálicos"]
    },
    {
        ageMonths: 4,
        title: "Hitos - 4 Meses",
        description: "Aprende a balbucear y a darse la vuelta.",
        items: ["Se da la vuelta de boca arriba a boca abajo", "Se lleva las manos a la boca", "Sostiene la cabeza sin apoyo"]
    },
    {
        ageMonths: 6,
        title: "Hitos - 6 Meses",
        description: "Comienza la alimentación complementaria y se sienta solo.",
        items: ["Se sienta con apoyo", "Reacciona ante su nombre", "Empieza a balbucear con consonantes (da-da, ba-ba)"]
    },
    {
        ageMonths: 9,
        title: "Hitos - 9 Meses",
        description: "Explora su entorno gateando y haciendo gestos.",
        items: ["Se arrastra o gatea", "Entiende el 'no'", "Usa el pulgar e índice para agarrar cosas (pinza)"]
    },
    {
        ageMonths: 12,
        title: "Hitos - 12 Meses",
        description: "¡Primer año! Empieza a caminar y decir sus primeras palabras.",
        items: ["Camina apoyándose en muebles", "Dice 'mamá' o 'papá'", "Encuentra objetos ocultos fácilmente"]
    },
    {
        ageMonths: 18,
        title: "Hitos - 18 Meses",
        description: "Independencia creciente y primeras frases.",
        items: ["Camina solo", "Dice varias palabras sencillas", "Señala para mostrar cosas"]
    },
    {
        ageMonths: 24,
        title: "Hitos - 24 Meses",
        description: "Gran desarrollo del lenguaje y habilidades motoras.",
        items: ["Corre y patea pelotas", "Frases de 2 palabras", "Empieza a clasificar formas y colores"]
    }
];

export function getNextMilestone(birthDate: string | Date | null | undefined): Milestone | null {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const now = new Date();
    const ageInMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());

    return pediatricMilestones.find(m => m.ageMonths >= ageInMonths) || pediatricMilestones[pediatricMilestones.length - 1];
}

export function getVaccineUrgency(vaccinations: any[]): { vaccine: any, daysRemaining: number } | null {
    const pending = vaccinations
        .filter(v => v.status === 'PENDING' && v.nextDoseDate)
        .sort((a, b) => new Date(a.nextDoseDate).getTime() - new Date(b.nextDoseDate).getTime());

    if (pending.length === 0) return null;

    const next = pending[0];
    const diffTime = new Date(next.nextDoseDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { vaccine: next, daysRemaining: diffDays };
}
