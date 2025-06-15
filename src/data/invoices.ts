
import { Invoice } from '@/types/invoice';

export const initialInvoices: Invoice[] = [
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    uuid: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    clientId: '2',
    date: new Date('2025-06-12').toISOString(),
    amount: 15000,
    cfdiUse: 'G03',
    satStatus: 'Vigente',
    journalEntryId: '2',
    fileName: 'factura_juan_perez_01.xml',
  },
];
