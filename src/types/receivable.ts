
export type AccountReceivableStatus = 'Pendiente' | 'Pagada' | 'Vencida' | 'Parcialmente Pagada';

export type Payment = {
  id: string;
  date: string; // ISO date string
  amount: number;
  notes?: string;
};

export type AccountReceivable = {
  id: string;
  clientId: string;
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
