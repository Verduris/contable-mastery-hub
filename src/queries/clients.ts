
import { supabase } from "@/integrations/supabase/client";
import { Client, AddClientFormData, AuditLogEvent } from "@/types/client";
import { Tables } from "@/integrations/supabase/types";

// Helper to map from Supabase row to Client type
const fromSupabase = (row: Tables<'clients'>): Client => ({
  id: row.id,
  name: row.name,
  rfc: row.rfc,
  type: row.type,
  email: row.email,
  phone: row.phone,
  status: row.status,
  taxRegime: row.tax_regime,
  address: row.address,
  cfdiUse: row.cfdi_use || undefined,
  associatedAccountId: row.associated_account_id,
  paymentMethod: row.payment_method || undefined,
  creditDays: row.credit_days || undefined,
  creditLimit: row.credit_limit || undefined,
  balance: row.balance,
  internalNotes: row.internal_notes || undefined,
  contractUrl: row.contract_url || undefined,
});

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching clients:", error);
    throw new Error("No se pudieron cargar los clientes.");
  }

  return data.map(fromSupabase);
}

// Helper to map from AddClientFormData to Supabase insert type
const toSupabase = (formData: AddClientFormData) => ({
    name: formData.name,
    rfc: formData.rfc,
    type: formData.type,
    email: formData.email,
    phone: formData.phone,
    status: formData.status,
    tax_regime: formData.taxRegime,
    address: formData.address,
    associated_account_id: formData.associatedAccountId,
    credit_days: formData.creditDays,
    credit_limit: formData.creditLimit,
    internal_notes: formData.internalNotes,
});

export async function addClient(clientData: AddClientFormData): Promise<Client> {
    const { data: newClientData, error } = await supabase
        .from('clients')
        .insert(toSupabase(clientData))
        .select()
        .single();

    if (error) {
        console.error("Error adding client:", error);
        if (error.code === '23505') { // unique_violation on 'rfc'
            throw new Error(`El cliente con RFC '${clientData.rfc}' ya existe.`);
        }
        throw new Error("No se pudo agregar el cliente.");
    }
    
    // This is a placeholder for user. In a real app, you'd get this from the session.
    const user = "Sistema"; 

    const { error: logError } = await supabase
        .from('client_audit_logs')
        .insert({
            client_id: newClientData.id,
            user: user,
            action: 'Cliente Creado',
            details: `Cliente "${newClientData.name}" registrado en el sistema.`
        });

    if (logError) {
        console.error("Error creating audit log:", logError);
        // Not throwing error, as the client creation was successful
    }

    return fromSupabase(newClientData);
}

export async function fetchClientAuditLogs(clientId: string): Promise<AuditLogEvent[]> {
    const { data, error } = await supabase
        .from('client_audit_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching audit logs:", error);
        throw new Error("No se pudo cargar el historial de cambios.");
    }
    
    return data.map(log => ({
        id: log.id,
        clientId: log.client_id,
        timestamp: log.created_at,
        user: log.user,
        action: log.action,
        details: log.details || undefined,
    }));
}
