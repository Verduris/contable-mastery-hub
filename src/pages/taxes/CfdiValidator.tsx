
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FileCheck, FileX, FileWarning } from 'lucide-react';
import { validateSatStatus } from '@/utils/satApi';
import { Badge } from '@/components/ui/badge';
import { SatStatus } from '@/types/invoice';

export const CfdiValidator = () => {
    const [uuid, setUuid] = useState('');

    const mutation = useMutation({
        mutationFn: validateSatStatus,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (uuid) {
            mutation.mutate(uuid);
        }
    };

    const getStatusVariant = (status: SatStatus): "default" | "destructive" | "secondary" => {
        switch (status) {
            case 'Vigente':
                return 'default';
            case 'Cancelada':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    placeholder="Introduce el Folio Fiscal (UUID)"
                    value={uuid}
                    onChange={(e) => setUuid(e.target.value)}
                    className="max-w-xs"
                />
                <Button type="submit" disabled={mutation.isPending || !uuid}>
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Validar CFDI
                </Button>
            </form>
            {mutation.isSuccess && (
                <Alert>
                    {mutation.data === 'Vigente' ? <FileCheck className="h-4 w-4" /> : <FileX className="h-4 w-4" />}
                    <AlertTitle>Resultado de la Validación</AlertTitle>
                    <AlertDescription className="flex items-center gap-2">
                        El estatus del CFDI en el SAT es: <Badge variant={getStatusVariant(mutation.data)}>{mutation.data}</Badge>
                    </AlertDescription>
                </Alert>
            )}
             {mutation.isError && (
                 <Alert variant="destructive">
                    <FileWarning className="h-4 w-4" />
                    <AlertTitle>Error de Validación</AlertTitle>
                    <AlertDescription>Ocurrió un error al validar el CFDI. Inténtalo de nuevo.</AlertDescription>
                </Alert>
            )}
        </div>
    );
};
