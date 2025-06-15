
-- Paso 1: Definir tipos ENUM para mejorar la integridad de los datos
CREATE TYPE public.account_type AS ENUM ('Activo', 'Pasivo', 'Capital', 'Ingresos', 'Egresos');
CREATE TYPE public.account_nature AS ENUM ('Deudora', 'Acreedora');
CREATE TYPE public.account_status AS ENUM ('Activa', 'Inactiva');

-- Paso 2: Crear la tabla de cuentas con una llave primaria UUID
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type public.account_type NOT NULL,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    nature public.account_nature NOT NULL,
    level INTEGER NOT NULL,
    status public.account_status NOT NULL DEFAULT 'Activa',
    parent_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    sat_code TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Paso 3: Agregar un índice en parent_id para mejorar el rendimiento
CREATE INDEX ON public.accounts (parent_id);

-- Paso 4: Habilitar la Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Paso 5: Crear una política para permitir a los usuarios autenticados gestionar las cuentas
CREATE POLICY "Allow authenticated users to manage accounts"
ON public.accounts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Paso 6: Insertar el catálogo de cuentas inicial, mapeando los IDs antiguos a nuevos UUIDs
WITH initial_data (old_id, code, name, type, balance, nature, level, status, old_parent_id, sat_code, description) AS (
    VALUES
    ('1', '1000', 'Activo', 'Activo'::account_type, 0, 'Deudora'::account_nature, 1, 'Activa'::account_status, NULL, '1', NULL),
    ('2', '1100', 'Bancos', 'Activo'::account_type, 150000, 'Deudora'::account_nature, 2, 'Activa'::account_status, '1', '102', NULL),
    ('3', '1200', 'Clientes', 'Activo'::account_type, 75000, 'Deudora'::account_nature, 2, 'Activa'::account_status, '1', '105', NULL),
    ('4', '2000', 'Pasivo', 'Pasivo'::account_type, 0, 'Acreedora'::account_nature, 1, 'Activa'::account_status, NULL, '2', NULL),
    ('5', '2100', 'Proveedores', 'Pasivo'::account_type, 50000, 'Acreedora'::account_nature, 2, 'Activa'::account_status, '4', '201', NULL),
    ('6', '4000', 'Ingresos', 'Ingresos'::account_type, 0, 'Acreedora'::account_nature, 1, 'Activa'::account_status, NULL, '401', NULL),
    ('7', '5000', 'Egresos', 'Egresos'::account_type, 0, 'Deudora'::account_nature, 1, 'Activa'::account_status, NULL, '501', NULL),
    ('8', '3000', 'Capital', 'Capital'::account_type, 175000, 'Acreedora'::account_nature, 1, 'Activa'::account_status, NULL, '3', NULL),
    ('9', '1100-01', 'Banco Nacional', 'Activo'::account_type, 150000, 'Deudora'::account_nature, 3, 'Activa'::account_status, '2', '102.01', NULL),
    ('10', '1200-01', 'Clientes Nacionales', 'Activo'::account_type, 75000, 'Deudora'::account_nature, 3, 'Activa'::account_status, '3', '105.01', NULL),
    ('11', '2100-01', 'Proveedores Nacionales', 'Pasivo'::account_type, 50000, 'Acreedora'::account_nature, 3, 'Activa'::account_status, '5', '201.01', NULL)
),
id_mapping AS (
    SELECT
        old_id,
        gen_random_uuid() as new_id
    FROM initial_data
)
INSERT INTO public.accounts (id, code, name, type, balance, nature, level, status, parent_id, sat_code, description)
SELECT
    m.new_id,
    d.code,
    d.name,
    d.type,
    d.balance,
    d.nature,
    d.level,
    d.status,
    (SELECT new_id FROM id_mapping WHERE old_id = d.old_parent_id),
    d.sat_code,
    d.description
FROM initial_data d
JOIN id_mapping m ON d.old_id = m.old_id;
