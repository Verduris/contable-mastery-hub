
import { addDays, isSaturday, isSunday, isSameDay, differenceInCalendarDays, startOfDay } from 'date-fns';

// Días inhábiles oficiales en México para 2025 (Art. 12 CFF y LFT Art. 74)
// No se consideran sábados ni domingos aquí, se manejan por separado.
const holidays2025: Date[] = [
    new Date('2025-01-01T06:00:00.000Z'), // Año Nuevo
    new Date('2025-02-03T06:00:00.000Z'), // Día de la Constitución
    new Date('2025-03-17T06:00:00.000Z'), // Natalicio de Benito Juárez
    new Date('2025-05-01T06:00:00.000Z'), // Día del Trabajo
    new Date('2025-09-16T06:00:00.000Z'), // Día de la Independencia
    new Date('2025-11-17T06:00:00.000Z'), // Día de la Revolución
    new Date('2025-12-25T06:00:00.000Z'), // Navidad
];

const isHoliday = (date: Date): boolean => {
    const cleanDate = startOfDay(date);
    return holidays2025.some(holiday => isSameDay(cleanDate, holiday));
};

const isWeekend = (date: Date): boolean => {
    return isSaturday(date) || isSunday(date);
};

export const isBusinessDay = (date: Date): boolean => {
    return !isWeekend(date) && !isHoliday(date);
};

export const addBusinessDays = (startDate: Date, days: number): Date => {
    let currentDate = startDate;
    let daysAdded = 0;
    
    if (days <= 0) return startDate;

    while (daysAdded < days) {
        currentDate = addDays(currentDate, 1);
        if (isBusinessDay(currentDate)) {
            daysAdded++;
        }
    }
    return currentDate;
};

export const countBusinessDays = (startDate: Date, endDate: Date): number => {
    if (endDate < startDate) return 0;

    const diffInDays = differenceInCalendarDays(endDate, startDate);
    let businessDays = 0;
    
    for (let i = 0; i <= diffInDays; i++) {
        const currentDate = addDays(startDate, i);
        if (isBusinessDay(currentDate)) {
            businessDays++;
        }
    }

    return businessDays;
};

