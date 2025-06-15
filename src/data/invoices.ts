
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
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    uuid: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    clientId: '1',
    date: new Date('2025-05-20').toISOString(),
    amount: 25000,
    cfdiUse: 'G01',
    satStatus: 'Cancelada',
    journalEntryId: undefined,
    fileName: 'factura_swc_01.xml',
  },
];
