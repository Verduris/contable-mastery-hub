
import { FiscalRegimen } from '@/types/fiscal';

export type TaxEventStatus = 'Pendiente' | 'Presentado' | 'Vencido';

export type TaxEvent = {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    status: TaxEventStatus;
    regime: FiscalRegimen | 'General';
    taxType: 'ISR' | 'IVA' | 'DIOT' | 'Contabilidad Electrónica' | 'Anual' | 'Personalizado';
    legalBasis: string;
    description: string;
    link?: string;
};

export const taxEvents: TaxEvent[] = [
    {
        id: '1',
        title: 'Declaración Mensual IVA',
        date: '2025-06-17',
        status: 'Pendiente',
        regime: 'Régimen Simplificado de Confianza',
        taxType: 'IVA',
        legalBasis: 'Art. 31 CFF',
        description: 'Presentar la declaración mensual de IVA correspondiente al periodo de Mayo 2025.',
        link: '/impuestos'
    },
    {
        id: '2',
        title: 'Declaración Mensual ISR',
        date: '2025-06-17',
        status: 'Pendiente',
        regime: 'Régimen Simplificado de Confianza',
        taxType: 'ISR',
        legalBasis: 'Art. 31 CFF',
        description: 'Presentar la declaración mensual de ISR correspondiente al periodo de Mayo 2025.',
        link: '/impuestos'
    },
    {
        id: '3',
        title: 'Declaración Informativa (DIOT)',
        date: '2025-06-30',
        status: 'Pendiente',
        regime: 'Régimen de Actividades Empresariales y Profesionales',
        taxType: 'DIOT',
        legalBasis: 'LIVA Art. 32',
        description: 'Presentar la Declaración Informativa de Operaciones con Terceros de Mayo 2025.',
        link: '/impuestos'
    },
    {
        id: '4',
        title: 'Contabilidad Electrónica',
        date: '2025-06-28',
        status: 'Pendiente',
        regime: 'Régimen General de Ley Personas Morales',
        taxType: 'Contabilidad Electrónica',
        legalBasis: 'Art. 28 CFF',
        description: 'Envío de la balanza de comprobación del mes de Mayo 2025.',
        link: '/polizas'
    },
     {
        id: '5',
        title: 'Pago Provisional ISR (Abril)',
        date: '2025-05-17',
        status: 'Vencido',
        regime: 'Régimen de Arrendamiento',
        taxType: 'ISR',
        legalBasis: 'Art. 31 CFF',
        description: 'Pago provisional de ISR no realizado para el periodo de Abril 2025.',
        link: '/impuestos'
    },
    {
        id: '6',
        title: 'Declaración Anual 2024',
        date: '2025-04-30',
        status: 'Presentado',
        regime: 'Sueldos y Salarios e Ingresos Asimilados a Salarios',
        taxType: 'Anual',
        legalBasis: 'LISR Art. 150',
        description: 'Declaración anual del ejercicio fiscal 2024 presentada correctamente.',
        link: '/reportes/estado-de-resultados'
    }
];
