
import { supabase } from '@/integrations/supabase/client';
import { AccountPayable } from '@/types/payable';
import { AddPayableFormData } from '@/components/payables/AddPayableDialog';
import { differenceInDays } from 'date-fns';

export const fetchPayables = async (): Promise<AccountPayable[]> => {
  const { data, error } = await supabase
    .from('accounts_payable')
    .select('*, paymentHistory:payable_payments(*)');

  if (error) {
    console.error('Error fetching payables:', error);
    throw new Error(error.message);
  }
  
  if (!data) return [];

  return data.map(p => ({
    id: p.id,
    supplierId: p.supplier_id,
    invoiceId: p.invoice_id || undefined,
    issueDate: p.issue_date,
    dueDate: p.due_date,
    totalAmount: p.total_amount,
    paidAmount: p.paid_amount,
    outstandingBalance: p.outstanding_balance,
    status: p.status,
    notes: p.notes || undefined,
    paymentMethod: p.payment_method || undefined,
    associatedAccountId: p.associated_account_id || undefined,
    paymentHistory: p.paymentHistory ? p.paymentHistory.map(ph => ({
      id: ph.id,
      date: ph.date,
      amount: ph.amount,
      notes: ph.notes || undefined,
    })) : [],
  }));
};

export const addPayable = async (payableData: AddPayableFormData) => {
    const status = differenceInDays(new Date(payableData.dueDate), new Date()) < 0 ? 'Vencida' : 'Pendiente';

    const { error } = await supabase
        .from('accounts_payable')
        .insert({
            supplier_id: payableData.supplierId,
            issue_date: payableData.issueDate,
            due_date: payableData.dueDate,
            total_amount: payableData.totalAmount,
            notes: payableData.notes,
            paid_amount: 0,
            status: status,
        });
    
    if (error) {
        console.error('Error adding payable:', error);
        throw new Error(error.message);
    }
};


export const recordPayablePayment = async ({ payableId, amount }: { payableId: string, amount: number }) => {
    const { error } = await supabase.rpc('record_payable_payment', {
        p_payable_id: payableId,
        p_amount: amount,
        p_date: new Date().toISOString().split('T')[0],
        p_notes: 'Pago registrado desde la app.'
    });

    if (error) {
        console.error('Error recording payment:', error);
        throw new Error(error.message);
    }
};

export const markPayableAsPaid = async (payableId: string) => {
    const { error } = await supabase.rpc('mark_payable_as_paid', {
        p_payable_id: payableId
    });

    if (error) {
        console.error('Error marking as paid:', error);
        throw new Error(error.message);
    }
};
