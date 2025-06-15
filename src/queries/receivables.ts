
import { supabase } from "@/integrations/supabase/client";
import { AccountReceivable } from "@/types/receivable";
import { Client } from "@/types/client";
import { Tables, Enums } from "@/integrations/supabase/types";

const mapSupabaseClient = (supabaseClient: Tables<'clients'>): Partial<Client> => ({
  id: supabaseClient.id,
  name: supabaseClient.name,
  creditLimit: supabaseClient.credit_limit || undefined,
});

export async function fetchReceivables(): Promise<AccountReceivable[]> {
  const { data, error } = await supabase
    .from("accounts_receivable")
    .select(`
        *,
        clients (*),
        receivable_payments (*)
    `)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching receivables:", error);
    throw new Error("No se pudieron cargar las cuentas por cobrar.");
  }

  return data.map(row => {
    const receivable: AccountReceivable = {
        id: row.id,
        clientId: row.client_id,
        invoiceId: row.invoice_id || undefined,
        issueDate: row.issue_date,
        dueDate: row.due_date,
        totalAmount: row.total_amount,
        paidAmount: row.paid_amount,
        outstandingBalance: row.outstanding_balance ?? 0,
        status: row.status as Enums<'account_receivable_status'>,
        notes: row.notes || undefined,
        paymentHistory: row.receivable_payments.map((p: Tables<'receivable_payments'>) => ({
            id: p.id,
            date: p.date,
            amount: p.amount,
            notes: p.notes || undefined,
        })),
        client: row.clients ? mapSupabaseClient(row.clients) : undefined,
    };
    return receivable;
  });
}

export async function recordPayment(receivableId: string, amount: number, date: string, notes?: string): Promise<void> {
    const { error } = await supabase.rpc('record_receivable_payment', {
        p_receivable_id: receivableId,
        p_amount: amount,
        p_date: date,
        p_notes: notes || null
    });

    if (error) {
        console.error("Error recording payment:", error);
        throw new Error("No se pudo registrar el cobro.");
    }
}

export async function markAsPaid(receivableId: string): Promise<void> {
    const { error } = await supabase.rpc('mark_receivable_as_paid', {
        p_receivable_id: receivableId
    });

    if (error) {
        console.error("Error marking as paid:", error);
        throw new Error("No se pudo marcar la cuenta como pagada.");
    }
}
