
import { JournalEntry } from '@/types/journal';

export const journalEntries: JournalEntry[] = [
    {
        id: '1',
        number: 'E-001',
        date: new Date('2025-06-10').toISOString(),
        concept: 'Compra de equipo de cómputo',
        type: 'Egreso',
        status: 'Borrador',
        lines: [
            { id: '1-1', accountId: '7', description: 'Compra de laptops', debit: 25000, credit: 0 },
            { id: '1-2', accountId: '2', description: 'Pago desde banco', debit: 0, credit: 25000 },
        ]
    },
    {
        id: '2',
        number: 'I-001',
        date: new Date('2025-06-12').toISOString(),
        concept: 'Venta de servicios de consultoría',
        type: 'Ingreso',
        status: 'Revisada',
        lines: [
            { id: '2-1', accountId: '3', description: 'Factura F-123', debit: 15000, credit: 0 },
            { id: '2-2', accountId: '6', description: 'Ingreso por consultoría', debit: 0, credit: 15000 },
        ]
    }
];
