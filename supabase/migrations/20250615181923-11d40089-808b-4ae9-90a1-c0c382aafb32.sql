
-- 1. Creamos un tipo ENUM para el estado de los eventos fiscales.
-- Esto asegura que solo los valores definidos puedan ser usados.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tax_event_status') THEN
        CREATE TYPE public.tax_event_status AS ENUM ('Pendiente', 'Presentado', 'Vencido');
    END IF;
END$$;

-- 2. Creamos la tabla para almacenar los eventos fiscales.
CREATE TABLE IF NOT EXISTS public.tax_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    status tax_event_status NOT NULL,
    regime TEXT NOT NULL,
    tax_type TEXT NOT NULL,
    legal_basis TEXT NOT NULL,
    description TEXT NOT NULL,
    link TEXT,
    receipt_url TEXT, -- Para el enlace al acuse de pago.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Habilitamos Row Level Security (RLS) en la tabla.
ALTER TABLE public.tax_events ENABLE ROW LEVEL SECURITY;

-- Borramos políticas existentes para evitar conflictos al re-ejecutar.
DROP POLICY IF EXISTS "Allow public read access" ON public.tax_events;
DROP POLICY IF EXISTS "Allow public insert access" ON public.tax_events;
DROP POLICY IF EXISTS "Allow public update access" ON public.tax_events;
DROP POLICY IF EXISTS "Allow public delete access" ON public.tax_events;

-- 4. Creamos políticas de acceso. Como aún no hay usuarios, serán públicas por ahora.
-- Actualizaremos esto cuando implementemos la autenticación.
CREATE POLICY "Allow public read access" ON public.tax_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.tax_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.tax_events FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.tax_events FOR DELETE USING (true);

-- 5. Creamos un bucket en Supabase Storage para los acuses de pago.
INSERT INTO storage.buckets (id, name, public)
VALUES ('tax_receipts', 'tax_receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Borramos políticas de storage existentes para evitar conflictos.
DROP POLICY IF EXISTS "Allow public access to tax receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload of tax receipts" ON storage.objects;

-- 6. Añadimos políticas de acceso para el nuevo bucket.
CREATE POLICY "Allow public access to tax receipts"
ON storage.objects FOR SELECT
USING ( bucket_id = 'tax_receipts' );

CREATE POLICY "Allow public upload of tax receipts"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'tax_receipts' );

-- 7. Insertamos los datos iniciales desde la aplicación a la nueva tabla.
-- Se insertarán solo si la tabla está vacía para evitar duplicados.
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM public.tax_events) THEN
      INSERT INTO public.tax_events (title, date, status, regime, tax_type, legal_basis, description, link) VALUES
      ('Declaración Mensual IVA', '2025-06-17', 'Pendiente', 'Régimen Simplificado de Confianza', 'IVA', 'Art. 31 CFF', 'Presentar la declaración mensual de IVA correspondiente al periodo de Mayo 2025.', '/impuestos'),
      ('Declaración Mensual ISR', '2025-06-17', 'Pendiente', 'Régimen Simplificado de Confianza', 'ISR', 'Art. 31 CFF', 'Presentar la declaración mensual de ISR correspondiente al periodo de Mayo 2025.', '/impuestos'),
      ('Declaración Informativa (DIOT)', '2025-06-30', 'Pendiente', 'Régimen de Actividades Empresariales y Profesionales', 'DIOT', 'LIVA Art. 32', 'Presentar la Declaración Informativa de Operaciones con Terceros de Mayo 2025.', '/impuestos'),
      ('Contabilidad Electrónica', '2025-06-28', 'Pendiente', 'Régimen General de Ley Personas Morales', 'Contabilidad Electrónica', 'Art. 28 CFF', 'Envío de la balanza de comprobación del mes de Mayo 2025.', '/polizas'),
      ('Pago Provisional ISR (Abril)', '2025-05-17', 'Vencido', 'Régimen de Arrendamiento', 'ISR', 'Art. 31 CFF', 'Pago provisional de ISR no realizado para el periodo de Abril 2025.', '/impuestos'),
      ('Declaración Anual 2024', '2025-04-30', 'Presentado', 'Sueldos y Salarios e Ingresos Asimilados a Salarios', 'Anual', 'LISR Art. 150', 'Declaración anual del ejercicio fiscal 2024 presentada correctamente.', '/reportes/estado-de-resultados');
   END IF;
END $$;
