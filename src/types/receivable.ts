
import { Payment } from './payment';
import { Client } from './client';

export type AccountReceivableStatus = 'Pendiente' | 'Pagada' | 'Vencida' | 'Parcialmente Pagada' | 'Cancelada';

export type AccountReceivable = {
  id: string;
  clientId: string;
  client?: Partial<Client>;
  invoiceId?: string;
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string
  totalAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  status: AccountReceivableStatus;
  notes?: string;
  paymentHistory?: Payment[];
};
