
import { AccountPayable } from '@/types/payable';
import { addDays, subDays } from 'date-fns';

const today = new Date();

export const initialPayables: AccountPayable[] = [
  {
    id: 'cxp-1',
    supplierId: '1', // Soluciones Web Creativas S.A. de C.V.
    issueDate: subDays(today, 15).toISOString(),
    dueDate: addDays(today, 15).toISOString(), // Vence en 15 días
    totalAmount: 8000,
    paidAmount: 0,
    outstandingBalance: 8000,
    status: 'Pendiente',
    notes: 'Factura de hosting anual #HOST-001.',
    paymentMethod: 'Transferencia',
    associatedAccountId: '9', // Gastos de Administración
  },
  {
    id: 'cxp-2',
    supplierId: '2', // Juan Pérez Rodríguez
    issueDate: subDays(today, 40).toISOString(),
    dueDate: subDays(today, 10).toISOString(), // Vencida hace 10 días
    totalAmount: 12500,
    paidAmount: 0,
    outstandingBalance: 12500,
    status: 'Vencida',
    notes: 'Factura por servicios de diseño #DSGN-050.',
    paymentMethod: 'Transferencia',
    associatedAccountId: '10', // Costo de Ventas
  },
  {
    id: 'cxp-3',
    supplierId: '3', // Marketing Digital Avanzado SC
    issueDate: subDays(today, 5).toISOString(),
    dueDate: subDays(today, 5).toISOString(), // Pagada
    totalAmount: 22000,
    paidAmount: 22000,
    outstandingBalance: 0,
    status: 'Pagada',
    notes: 'Factura de campaña publicitaria #MKT-MAY-24.',
  },
  {
    id: 'cxp-4',
    supplierId: '1',
    issueDate: subDays(today, 10).toISOString(),
    dueDate: addDays(today, 3).toISOString(), // Vence en 3 días (alerta amarilla)
    totalAmount: 5000,
    paidAmount: 2500,
    outstandingBalance: 2500,
    status: 'Parcialmente Pagada',
    notes: 'Abono a factura #SOFT-LIC-12.',
  },
];
