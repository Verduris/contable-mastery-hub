
import { Payment } from './payment';

export type AccountPayableStatus = 'Pendiente' | 'Pagada' | 'Vencida' | 'Parcialmente Pagada';

export type AccountPayable = {
  id: string;
  supplierId: string;
  invoiceId?: string;
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string
  totalAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  status: AccountPayableStatus;
  notes?: string;
  paymentMethod?: string;
  associatedAccountId?: string;
  paymentHistory?: Payment[];
};
