
-- Crear tipo de enumeración para el tipo de persona del cliente
CREATE TYPE public.person_type AS ENUM ('Física', 'Moral');

-- Crear tipo de enumeración para el estatus del cliente
CREATE TYPE public.client_status AS ENUM ('Activo', 'Inactivo');

-- Crear tabla para almacenar la información de los clientes
CREATE TABLE public.clients (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    rfc text NOT NULL UNIQUE,
    type public.person_type NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    status public.client_status NOT NULL DEFAULT 'Activo'::public.client_status,
    tax_regime text NOT NULL,
    address text NOT NULL,
    cfdi_use text NULL,
    associated_account_id uuid NULL,
    payment_method text NULL,
    credit_days integer NULL,
    credit_limit numeric(15, 2) NULL,
    balance numeric(15, 2) NOT NULL DEFAULT 0,
    internal_notes text NULL,
    contract_url text NULL,
    CONSTRAINT clients_associated_account_id_fkey FOREIGN KEY (associated_account_id) REFERENCES public.accounts(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.clients IS 'Almacena la información de los clientes del negocio.';

-- Crear tabla para el historial de cambios de los clientes
CREATE TABLE public.client_audit_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    client_id uuid NOT NULL,
    "user" text NOT NULL,
    action text NOT NULL,
    details text NULL,
    CONSTRAINT client_audit_logs_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.client_audit_logs IS 'Almacena el historial de cambios realizados en los registros de clientes.';

-- Habilitar Row Level Security (RLS) en las nuevas tablas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para permitir el acceso a usuarios autenticados
CREATE POLICY "Authenticated users can manage clients"
ON public.clients
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage client audit logs"
ON public.client_audit_logs
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

