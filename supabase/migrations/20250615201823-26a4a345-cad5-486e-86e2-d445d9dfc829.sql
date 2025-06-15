
-- Crear tipo de enumeración para el estatus de la cuenta por cobrar
CREATE TYPE public.account_receivable_status AS ENUM ('Pendiente', 'Pagada', 'Vencida', 'Parcialmente Pagada');

-- Crear tabla para las cuentas por cobrar
CREATE TABLE public.accounts_receivable (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    client_id uuid NOT NULL,
    invoice_id text NULL,
    issue_date date NOT NULL,
    due_date date NOT NULL,
    total_amount numeric(15, 2) NOT NULL,
    paid_amount numeric(15, 2) NOT NULL DEFAULT 0,
    outstanding_balance numeric(15, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status public.account_receivable_status NOT NULL DEFAULT 'Pendiente',
    notes text NULL,
    CONSTRAINT accounts_receivable_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.accounts_receivable IS 'Almacena las cuentas por cobrar de la empresa.';
COMMENT ON COLUMN public.accounts_receivable.outstanding_balance IS 'Calculado automáticamente como total_amount - paid_amount.';

-- Crear tabla para el historial de pagos de las cuentas por cobrar
CREATE TABLE public.receivable_payments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    account_receivable_id uuid NOT NULL,
    date date NOT NULL,
    amount numeric(15, 2) NOT NULL,
    notes text NULL,
    CONSTRAINT receivable_payments_account_receivable_id_fkey FOREIGN KEY (account_receivable_id) REFERENCES public.accounts_receivable(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.receivable_payments IS 'Almacena los pagos individuales para cada cuenta por cobrar.';

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivable_payments ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para permitir el acceso a usuarios autenticados
CREATE POLICY "Authenticated users can manage accounts receivable"
ON public.accounts_receivable
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage receivable payments"
ON public.receivable_payments
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Función para registrar un pago a una cuenta por cobrar
CREATE OR REPLACE FUNCTION public.record_receivable_payment(
    p_receivable_id uuid,
    p_amount numeric,
    p_date date,
    p_notes text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_amount numeric;
    v_new_paid_amount numeric;
    v_due_date date;
    v_new_status public.account_receivable_status;
BEGIN
    -- 1. Insertar el pago
    INSERT INTO public.receivable_payments (account_receivable_id, date, amount, notes)
    VALUES (p_receivable_id, p_date, p_amount, p_notes);

    -- 2. Obtener valores actuales y actualizar la cuenta por cobrar
    SELECT total_amount, paid_amount, due_date
    INTO v_total_amount, v_new_paid_amount, v_due_date
    FROM public.accounts_receivable
    WHERE id = p_receivable_id;

    v_new_paid_amount := v_new_paid_amount + p_amount;

    -- 3. Determinar el nuevo estatus
    IF v_new_paid_amount >= v_total_amount THEN
        v_new_status := 'Pagada';
    ELSEIF v_due_date < current_date THEN
        v_new_status := 'Vencida';
    ELSE
        v_new_status := 'Parcialmente Pagada';
    END IF;

    -- 4. Actualizar el registro de la cuenta por cobrar
    UPDATE public.accounts_receivable
    SET
        paid_amount = v_new_paid_amount,
        status = v_new_status
    WHERE id = p_receivable_id;
END;
$$;

-- Función para marcar una cuenta por cobrar como pagada
CREATE OR REPLACE FUNCTION public.mark_receivable_as_paid(
    p_receivable_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_outstanding_balance numeric;
BEGIN
    -- Obtener saldo pendiente
    SELECT outstanding_balance INTO v_outstanding_balance
    FROM public.accounts_receivable
    WHERE id = p_receivable_id;
    
    -- Si hay saldo, registrar un pago por el monto restante
    IF v_outstanding_balance > 0 THEN
        INSERT INTO public.receivable_payments (account_receivable_id, date, amount, notes)
        VALUES (p_receivable_id, current_date, v_outstanding_balance, 'Pago de saldo restante para marcar como pagada.');
    END IF;

    -- Actualizar el registro de la cuenta por cobrar a pagada
    UPDATE public.accounts_receivable
    SET
        paid_amount = total_amount,
        status = 'Pagada'
    WHERE id = p_receivable_id;
END;
$$;

