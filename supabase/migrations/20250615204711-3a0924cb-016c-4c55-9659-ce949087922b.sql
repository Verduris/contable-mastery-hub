
-- Paso 1: Crear el tipo de dato para el estatus de la factura en el SAT
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_sat_status') THEN
        CREATE TYPE public.invoice_sat_status AS ENUM ('Vigente', 'Cancelada');
    END IF;
END$$;

-- Paso 2: Crear la tabla de facturas (invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid NOT NULL PRIMARY KEY, -- Folio Fiscal (UUID)
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    journal_entry_id uuid NULL, -- Se llenará después de crear la póliza
    date timestamptz NOT NULL,
    amount numeric NOT NULL,
    cfdi_use text NOT NULL,
    sat_status public.invoice_sat_status NOT NULL,
    file_name text NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security para la tabla de facturas
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
-- Permitir que cualquiera pueda ver las facturas (puedes ajustar esto si implementas autenticación)
CREATE POLICY "Las facturas son visibles para todos." ON public.invoices FOR SELECT USING (true);
-- Permitir que usuarios autenticados creen facturas (usaremos una función para esto)
CREATE POLICY "Las facturas pueden ser creadas por usuarios autenticados." ON public.invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Paso 3: Modificar tablas relacionadas para usar UUID en lugar de TEXT para las referencias
ALTER TABLE public.accounts_payable DROP COLUMN IF EXISTS invoice_id;
ALTER TABLE public.accounts_payable ADD COLUMN invoice_id uuid NULL REFERENCES public.invoices(id) ON DELETE SET NULL;

ALTER TABLE public.accounts_receivable DROP COLUMN IF EXISTS invoice_id;
ALTER TABLE public.accounts_receivable ADD COLUMN invoice_id uuid NULL REFERENCES public.invoices(id) ON DELETE SET NULL;

ALTER TABLE public.journal_entries DROP COLUMN IF EXISTS invoice_id;
ALTER TABLE public.journal_entries ADD COLUMN invoice_id uuid NULL REFERENCES public.invoices(id) ON DELETE SET NULL;

ALTER TABLE public.journal_entries DROP COLUMN IF EXISTS client_id;
ALTER TABLE public.journal_entries ADD COLUMN client_id uuid NULL REFERENCES public.clients(id) ON DELETE SET NULL;

-- Agregar la referencia desde invoices hacia journal_entries
ALTER TABLE public.invoices ADD CONSTRAINT invoices_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE SET NULL;

-- Paso 4: Crear una función para manejar la creación de la factura y todas sus relaciones de forma segura y transaccional
CREATE OR REPLACE FUNCTION public.create_invoice_with_relations(
    p_invoice_id uuid,
    p_client_id uuid,
    p_date timestamptz,
    p_amount numeric,
    p_cfdi_use text,
    p_sat_status public.invoice_sat_status,
    p_file_name text
)
RETURNS uuid -- Devuelve el ID de la nueva póliza contable
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_journal_entry_id uuid;
    v_receivable_id uuid;
    v_client_name text;
    v_client_account_id uuid;
    v_credit_days int;
    v_next_entry_number text;
    v_ingresos_account_id uuid;
BEGIN
    -- 1. Insertar la nueva factura
    INSERT INTO public.invoices (id, client_id, date, amount, cfdi_use, sat_status, file_name)
    VALUES (p_invoice_id, p_client_id, p_date, p_amount, p_cfdi_use, p_sat_status, p_file_name);

    -- Obtener datos del cliente
    SELECT name, associated_account_id, COALESCE(credit_days, 30) INTO v_client_name, v_client_account_id, v_credit_days
    FROM public.clients WHERE id = p_client_id;
    
    -- Obtener el siguiente número de póliza de Ingreso
    SELECT 'I-' || lpad((COALESCE(max(substring(number from 3)::int), 0) + 1)::text, 3, '0')
    INTO v_next_entry_number
    FROM public.journal_entries WHERE type = 'Ingreso';

    -- Buscar la cuenta de "Ingresos por Servicios"
    SELECT id INTO v_ingresos_account_id FROM public.accounts WHERE name = 'Ingresos por Servicios' LIMIT 1;
    IF v_ingresos_account_id IS NULL THEN
        RAISE EXCEPTION 'La cuenta "Ingresos por Servicios" no fue encontrada. Por favor, créala en el catálogo de cuentas.';
    END IF;
    IF v_client_account_id IS NULL THEN
        RAISE EXCEPTION 'El cliente no tiene una cuenta contable asociada.';
    END IF;

    -- 2. Crear la póliza contable
    INSERT INTO public.journal_entries (number, date, concept, type, status, client_id, invoice_id)
    VALUES (
        v_next_entry_number,
        p_date,
        'Factura ' || substring(p_invoice_id::text from 1 for 8) || ' - ' || v_client_name,
        'Ingreso',
        'Revisada',
        p_client_id,
        p_invoice_id
    ) RETURNING id INTO v_journal_entry_id;

    -- 3. Crear los movimientos de la póliza
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
    VALUES 
        (v_journal_entry_id, v_client_account_id, 'Factura ' || substring(p_invoice_id::text from 1 for 8), p_amount, 0),
        (v_journal_entry_id, v_ingresos_account_id, 'Ingresos por factura ' || substring(p_invoice_id::text from 1 for 8), 0, p_amount);
        
    -- 4. Actualizar la factura con el ID de la póliza creada
    UPDATE public.invoices
    SET journal_entry_id = v_journal_entry_id
    WHERE id = p_invoice_id;

    -- 5. Crear la cuenta por cobrar correspondiente
    INSERT INTO public.accounts_receivable (client_id, invoice_id, issue_date, due_date, total_amount, status, notes)
    VALUES (
        p_client_id,
        p_invoice_id,
        p_date::date,
        (p_date + (v_credit_days || ' days')::interval)::date,
        p_amount,
        'Pendiente',
        'Generado desde factura ' || substring(p_invoice_id::text from 1 for 8) || '...'
    );

    RETURN v_journal_entry_id;
END;
$$;
