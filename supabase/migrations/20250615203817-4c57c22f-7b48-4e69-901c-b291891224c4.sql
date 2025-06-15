
-- Enum for payable status
CREATE TYPE public.account_payable_status AS ENUM (
    'Pendiente',
    'Pagada',
    'Parcialmente Pagada',
    'Vencida'
);

-- Table for Accounts Payable
CREATE TABLE public.accounts_payable (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    supplier_id uuid NOT NULL,
    invoice_id text NULL,
    issue_date date NOT NULL,
    due_date date NOT NULL,
    total_amount numeric NOT NULL,
    paid_amount numeric NOT NULL DEFAULT 0,
    outstanding_balance numeric GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status public.account_payable_status NOT NULL DEFAULT 'Pendiente'::public.account_payable_status,
    notes text NULL,
    payment_method text NULL,
    associated_account_id uuid NULL,
    CONSTRAINT accounts_payable_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.clients(id) ON DELETE RESTRICT
);
-- Enable RLS
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public.accounts_payable.outstanding_balance IS 'Calculado como total_amount - paid_amount';

-- Table for Payable Payments
CREATE TABLE public.payable_payments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    account_payable_id uuid NOT NULL,
    date date NOT NULL,
    amount numeric NOT NULL,
    notes text NULL,
    CONSTRAINT payable_payments_account_payable_id_fkey FOREIGN KEY (account_payable_id) REFERENCES public.accounts_payable(id) ON DELETE CASCADE
);
-- Enable RLS
ALTER TABLE public.payable_payments ENABLE ROW LEVEL SECURITY;

-- RPC function to record a payment for a payable
CREATE OR REPLACE FUNCTION public.record_payable_payment(p_payable_id uuid, p_amount numeric, p_date date, p_notes text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_total_amount numeric;
    v_new_paid_amount numeric;
    v_due_date date;
    v_new_status public.account_payable_status;
BEGIN
    -- 1. Insertar el pago
    INSERT INTO public.payable_payments (account_payable_id, date, amount, notes)
    VALUES (p_payable_id, p_date, p_amount, p_notes);

    -- 2. Obtener valores actuales y actualizar la cuenta por pagar
    SELECT total_amount, paid_amount, due_date
    INTO v_total_amount, v_new_paid_amount, v_due_date
    FROM public.accounts_payable
    WHERE id = p_payable_id;

    v_new_paid_amount := v_new_paid_amount + p_amount;

    -- 3. Determinar el nuevo estatus
    IF v_new_paid_amount >= v_total_amount THEN
        v_new_status := 'Pagada';
    ELSEIF v_due_date < current_date THEN
        v_new_status := 'Vencida';
    ELSE
        v_new_status := 'Parcialmente Pagada';
    END IF;

    -- 4. Actualizar el registro de la cuenta por pagar
    UPDATE public.accounts_payable
    SET
        paid_amount = v_new_paid_amount,
        status = v_new_status
    WHERE id = p_payable_id;
END;
$function$
;

-- RPC function to mark a payable as fully paid
CREATE OR REPLACE FUNCTION public.mark_payable_as_paid(p_payable_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_outstanding_balance numeric;
BEGIN
    -- Obtener saldo pendiente
    SELECT outstanding_balance INTO v_outstanding_balance
    FROM public.accounts_payable
    WHERE id = p_payable_id;
    
    -- Si hay saldo, registrar un pago por el monto restante
    IF v_outstanding_balance > 0 THEN
        INSERT INTO public.payable_payments (account_payable_id, date, amount, notes)
        VALUES (p_payable_id, current_date, v_outstanding_balance, 'Pago de saldo restante para marcar como pagada.');
    END IF;

    -- Actualizar el registro de la cuenta por pagar a pagada
    UPDATE public.accounts_payable
    SET
        paid_amount = total_amount,
        status = 'Pagada'
    WHERE id = p_payable_id;
END;
$function$
;
