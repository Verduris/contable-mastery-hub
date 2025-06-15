import { supabase } from '@/integrations/supabase/client';
import { Invoice, SatStatus } from '@/types/invoice';
import { Client } from '@/types/client';
import { Tables } from '@/integrations/supabase/types';

export interface AddInvoicePayload {
    id: string; // UUID from XML
    clientId: string;
    date: string; // ISO String
    amount: number;
    cfdiUse: string;
    satStatus: SatStatus;
    fileName: string;
}

export const fetchInvoices = async (): Promise<Invoice[]> => {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            id,
            client_id,
            journal_entry_id,
            date,
            amount,
            cfdi_use,
            sat_status,
            file_name,
            journal_entries (
                id,
                number
            )
        `)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching invoices:', error);
        throw new Error(error.message);
    }
    
    if (!data) return [];

    return data.map(invoice => {
        const journalEntryData = invoice.journal_entries as { id: string; number: string; } | null;

        return {
            id: invoice.id,
            uuid: invoice.id, // for compatibility
            clientId: invoice.client_id,
            date: invoice.date,
            amount: invoice.amount,
            cfdiUse: invoice.cfdi_use,
            satStatus: invoice.sat_status,
            fileName: invoice.file_name || undefined,
            journalEntryId: invoice.journal_entry_id || undefined,
            journalEntry: journalEntryData ? {
                id: journalEntryData.id,
                number: journalEntryData.number,
            } : undefined,
        };
    });
};

export const addInvoice = async (invoiceData: AddInvoicePayload) => {
    const { error } = await supabase.rpc('create_invoice_with_relations', {
        p_invoice_id: invoiceData.id,
        p_client_id: invoiceData.clientId,
        p_date: invoiceData.date,
        p_amount: invoiceData.amount,
        p_cfdi_use: invoiceData.cfdiUse,
        p_sat_status: invoiceData.satStatus,
        p_file_name: invoiceData.fileName,
    });

    if (error) {
        console.error('Error creating invoice:', error);
        throw new Error(error.message);
    }
};

const mapSupabaseToClient = (data: Tables<'clients'>): Client => {
    return {
        id: data.id,
        name: data.name,
        rfc: data.rfc,
        email: data.email,
        phone: data.phone,
        address: data.address,
        type: data.type,
        status: data.status,
        taxRegime: data.tax_regime,
        balance: data.balance,
        creditLimit: data.credit_limit ?? undefined,
        creditDays: data.credit_days ?? undefined,
        cfdiUse: data.cfdi_use ?? undefined,
        paymentMethod: data.payment_method ?? undefined,
        internalNotes: data.internal_notes ?? undefined,
        associatedAccountId: data.associated_account_id ?? undefined,
        contractUrl: data.contract_url ?? undefined,
    };
};

export const fetchClients = async (): Promise<Client[]> => {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching clients:', error);
        throw new Error(error.message);
    }
    
    if (!data) return [];

    return data.map(mapSupabaseToClient);
};
