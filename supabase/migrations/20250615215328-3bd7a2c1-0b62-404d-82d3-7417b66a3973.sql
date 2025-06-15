
-- Primero, agregamos el estado 'Cancelada' al tipo de estatus de las cuentas por cobrar.
ALTER TYPE public.account_receivable_status ADD VALUE 'Cancelada';

-- Luego, creamos una función para orquestar la cancelación de una factura y sus registros relacionados.
CREATE OR REPLACE FUNCTION public.cancel_invoice(p_invoice_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_journal_entry_id uuid;
BEGIN
    -- 1. Actualizar el estatus de la factura a 'Cancelada'
    UPDATE public.invoices
    SET sat_status = 'Cancelada'
    WHERE id = p_invoice_id
    RETURNING journal_entry_id INTO v_journal_entry_id;

    -- 2. Si existe una póliza contable asociada, se anula.
    IF v_journal_entry_id IS NOT NULL THEN
        UPDATE public.journal_entries
        SET status = 'Anulada'
        WHERE id = v_journal_entry_id;
    END IF;

    -- 3. Se busca y se actualiza la cuenta por cobrar correspondiente a 'Cancelada'.
    UPDATE public.accounts_receivable
    SET status = 'Cancelada'
    WHERE invoice_id = p_invoice_id;

END;
$$;
