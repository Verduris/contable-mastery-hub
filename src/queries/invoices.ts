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
            journal_entries:journal_entry_id (
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

export const uploadInvoiceFile = async (file: File, invoiceId: string): Promise<string> => {
    const filePath = `${invoiceId}/${file.name}`;
    const { data, error } = await supabase.storage
        .from('invoice_files')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
        });

    if (error) {
        console.error('Error uploading invoice file:', error);
        throw new Error('Error al subir el archivo de la factura.');
    }
    
    if (!data) {
        throw new Error('No se recibió la ruta del archivo después de subirlo.');
    }
    
    return data.path;
};
