
import { AccountReceivable } from '@/types/receivable';
import { addDays, subDays } from 'date-fns';

const today = new Date();

export const initialReceivables: AccountReceivable[] = [
  {
    id: 'cxc-1',
    clientId: '1', // Soluciones Web Creativas S.A. de C.V.
    issueDate: subDays(today, 20).toISOString(),
    dueDate: addDays(today, 10).toISOString(), // Vence en 10 días
    totalAmount: 15000,
    paidAmount: 0,
    outstandingBalance: 15000,
    status: 'Pendiente',
    notes: 'Factura #F001. A la espera de pago.',
    paymentHistory: [],
  },
  {
    id: 'cxc-2',
    clientId: '1',
    issueDate: subDays(today, 45).toISOString(),
    dueDate: subDays(today, 15).toISOString(), // Vencida hace 15 días
    totalAmount: 20000,
    paidAmount: 5000,
    outstandingBalance: 15000,
    status: 'Vencida',
    notes: 'Factura #F002. Cliente contactado, prometen pago pronto.',
    paymentHistory: [
      { id: 'pay-1', date: subDays(today, 20).toISOString(), amount: 5000, notes: 'Abono inicial' }
    ],
  },
  {
    id: 'cxc-3',
    clientId: '2', // Juan Pérez Rodríguez
    issueDate: subDays(today, 10).toISOString(),
    dueDate: subDays(today, 10).toISOString(), // Pagada
    totalAmount: 5000,
    paidAmount: 5000,
    outstandingBalance: 0,
    status: 'Pagada',
    notes: 'Factura #F003. Pago contra entrega.',
    invoiceId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    paymentHistory: [
      { id: 'pay-2', date: subDays(today, 10).toISOString(), amount: 5000, notes: 'Pago completo' }
    ],
  },
  {
    id: 'cxc-4',
    clientId: '3', // Marketing Digital Avanzado SC
    issueDate: subDays(today, 5).toISOString(),
    dueDate: addDays(today, 4).toISOString(), // Vence en 4 días (alerta amarilla)
    totalAmount: 35000,
    paidAmount: 10000,
    outstandingBalance: 25000,
    status: 'Parcialmente Pagada',
    notes: 'Primer abono registrado. A la espera del pago restante.',
    paymentHistory: [
      { id: 'pay-3', date: subDays(today, 2).toISOString(), amount: 10000, notes: 'Primer abono' }
    ],
  },
  {
    id: 'cxc-5',
    clientId: '3',
    issueDate: subDays(today, 60).toISOString(),
    dueDate: subDays(today, 0).toISOString(), // Vence hoy
    totalAmount: 12000,
    paidAmount: 0,
    outstandingBalance: 12000,
    status: 'Pendiente',
    notes: 'Factura #F005.',
    paymentHistory: [],
  },
];
