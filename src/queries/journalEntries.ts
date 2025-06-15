
import { supabase } from "@/integrations/supabase/client";
import { JournalEntry, JournalEntryFormData, JournalEntryStatus } from "@/types/journal";

export async function fetchJournalEntries(clientId?: string): Promise<JournalEntry[]> {
  let query = supabase
    .from("journal_entries")
    .select(`
      id,
      number,
      date,
      concept,
      type,
      status,
      reference,
      client_id,
      invoice_id,
      journal_entry_lines (
        id,
        account_id,
        description,
        debit,
        credit
      )
    `)
    .order("date", { ascending: false });

  if (clientId) {
    query =       .eq('client_id', clientId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching journal entries:", error);
    throw new Error("No se pudieron cargar las pólizas.");
  }

  return data.map((entry) => ({
    id: entry.id,
    number: entry.number,
    date: entry.date,
    concept: entry.concept,
    type: entry.type,
    status: entry.status as JournalEntryStatus,
    reference: entry.reference || undefined,
    clientId: entry.client_id || undefined,
    invoiceId: entry.invoice_id || undefined,
    lines: entry.journal_entry_lines.map((line: any) => ({
      id: line.id,
      accountId: line.account_id,
      description: line.description,
      debit: line.debit,
      credit: line.credit,
    })),
  })) as JournalEntry[];
}

export async function upsertJournalEntry(entryData: JournalEntryFormData, entryId: string | null): Promise<any> {
    const { data, error } = await supabase.rpc('upsert_journal_entry', {
        entry_id: entryId,
        entry_number: entryData.number,
        entry_date: entryData.date.toISOString(),
        entry_concept: entryData.concept,
        entry_type: entryData.type,
        entry_status: entryData.status,
        entry_reference: entryData.reference || null,
        entry_client_id: entryData.clientId || null,
        lines: entryData.lines.map(line => ({
            account_id: line.accountId,
            description: line.description,
            debit: line.debit,
            credit: line.credit
        }))
    });

    if (error) {
        console.error("Error upserting journal entry:", error);
        if (error.code === '23505') { // unique_violation on 'number'
             throw new Error(`La póliza con número '${entryData.number}' ya existe.`);
        }
        throw new Error("No se pudo guardar la póliza.");
    }
    return data;
}

export async function updateJournalEntryStatus(entryId: string, status: JournalEntryStatus): Promise<any> {
    const { data, error } = await supabase
        .from('journal_entries')
        .update({ status })
        .eq('id', entryId)
        .select();
    
    if (error) {
        console.error("Error updating journal entry status:", error);
        throw new Error("No se pudo actualizar el estado de la póliza.");
    }
    return data;
}

export async function fetchNextEntryNumber(): Promise<string> {
    const { data, error } = await supabase
        .from('journal_entries')
        .select('number')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = "The result contains 0 rows"
        console.error("Error fetching last journal entry number:", error);
        return "P-001"; // Fallback
    }

    if (!data) {
        return "P-001";
    }

    const lastNumStr = data.number.split('-').pop();
    if (lastNumStr && !isNaN(parseInt(lastNumStr, 10))) {
        const lastNum = parseInt(lastNumStr, 10);
        return `P-${(lastNum + 1).toString().padStart(3, '0')}`;
    }

    return "P-001"; // Fallback if format is unexpected
}
