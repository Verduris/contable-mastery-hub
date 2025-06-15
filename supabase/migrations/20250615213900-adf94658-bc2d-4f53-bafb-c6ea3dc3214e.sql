
-- Crea el bucket para los archivos XML de las facturas
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice_files', 'invoice_files', true)
ON CONFLICT (id) DO NOTHING;

-- Borra políticas existentes para evitar errores si se re-ejecuta
DROP POLICY IF EXISTS "Public read access for invoice files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload invoice files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own invoice files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete invoice files" ON storage.objects;

-- Permite el acceso público de lectura a los archivos del bucket
CREATE POLICY "Public read access for invoice files"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'invoice_files' );

-- Permite a los usuarios autenticados subir archivos al bucket
CREATE POLICY "Authenticated users can upload invoice files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK ( bucket_id = 'invoice_files' );

-- Permite a los usuarios autenticados actualizar sus propios archivos
CREATE POLICY "Authenticated users can update their own invoice files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING ( bucket_id = 'invoice_files' );

-- Permite a los usuarios autenticados eliminar archivos
CREATE POLICY "Authenticated users can delete invoice files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING ( bucket_id = 'invoice_files' );

