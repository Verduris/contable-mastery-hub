
-- Crear tipos de enumeración para las pólizas
CREATE TYPE public.journal_entry_type AS ENUM ('Ingreso', 'Egreso', 'Diario');
CREATE TYPE public.journal_entry_status AS ENUM ('Borrador', 'Revisada', 'Anulada');

-- Crear tabla para las cabeceras de las pólizas
CREATE TABLE public.journal_entries (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    number text NOT NULL UNIQUE,
    date timestamptz NOT NULL,
    concept text NOT NULL,
    type public.journal_entry_type NOT NULL,
    status public.journal_entry_status NOT NULL DEFAULT 'Borrador'::public.journal_entry_status,
    reference text NULL,
    client_id text NULL, -- Aún no existe una tabla de clientes en la BD
    invoice_id text NULL
);
COMMENT ON TABLE public.journal_entries IS 'Almacena la información de la cabecera de las pólizas contables.';

-- Crear tabla para los movimientos de las pólizas
CREATE TABLE public.journal_entry_lines (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    journal_entry_id uuid NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    account_id uuid NOT NULL REFERENCES public.accounts(id),
    description text NOT NULL,
    debit numeric NOT NULL DEFAULT 0,
    credit numeric NOT NULL DEFAULT 0,
    CONSTRAINT debit_non_negative CHECK (debit >= 0),
    CONSTRAINT credit_non_negative CHECK (credit >= 0)
);
COMMENT ON TABLE public.journal_entry_lines IS 'Almacena los movimientos individuales de cada póliza contable.';

-- Función para crear o actualizar una póliza y sus movimientos
CREATE OR REPLACE FUNCTION public.upsert_journal_entry(
    entry_id uuid, -- null para una nueva póliza
    entry_number text,
    entry_date timestamptz,
    entry_concept text,
    entry_type public.journal_entry_type,
    entry_status public.journal_entry_status,
    entry_reference text,
    entry_client_id text,
    lines jsonb -- Ejemplo: [{account_id, description, debit, credit}]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Buena práctica para eludir RLS si se añade en el futuro
AS $$
DECLARE
    new_entry_id uuid;
    line record;
BEGIN
    -- Insertar o actualizar la cabecera de la póliza
    IF entry_id IS NULL THEN
        -- Insertar nueva póliza
        INSERT INTO public.journal_entries (number, date, concept, type, status, reference, client_id)
        VALUES (entry_number, entry_date, entry_concept, entry_type, entry_status, entry_reference, entry_client_id)
        RETURNING id INTO new_entry_id;
    ELSE
        -- Actualizar póliza existente
        UPDATE public.journal_entries
        SET
            number = entry_number,
            date = entry_date,
            concept = entry_concept,
            type = entry_type,
            status = entry_status,
            reference = entry_reference,
            client_id = entry_client_id
        WHERE id = entry_id;
        new_entry_id := entry_id;

        -- Eliminar movimientos existentes para reemplazarlos
        DELETE FROM public.journal_entry_lines WHERE journal_entry_id = new_entry_id;
    END IF;

    -- Insertar los nuevos movimientos
    FOR line IN SELECT * FROM jsonb_to_recordset(lines) as x(account_id uuid, description text, debit numeric, credit numeric)
    LOOP
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
        VALUES (new_entry_id, line.account_id, line.description, line.debit, line.credit);
    END LOOP;

    RETURN new_entry_id;
END;
$$;
