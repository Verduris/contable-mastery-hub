
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Library, HelpCircle, ShieldAlert } from 'lucide-react';
import { getFiscalRegimen } from '@/utils/fiscalRegimenValidator';
import { Badge } from '@/components/ui/badge';
import { FiscalRegimen } from '@/types/fiscal';

export const FiscalRegimenValidator = () => {
    const [rfc, setRfc] = useState('');

    const mutation = useMutation({
        mutationFn: getFiscalRegimen,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rfc) {
            mutation.mutate(rfc);
        }
    };
    
    const getStatusVariant = (regimen: FiscalRegimen): "default" | "secondary" | "destructive" => {
        if (regimen === 'No Encontrado') {
            return 'destructive'
        }
        return 'default'
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    placeholder="Introduce un RFC para consultar su régimen"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    className="max-w-xs"
                />
                <Button type="submit" disabled={mutation.isPending || !rfc}>
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Consultar Régimen
                </Button>
            </form>
            {mutation.isSuccess && (
                <Alert variant={mutation.data.regimen === 'No Encontrado' ? 'destructive' : 'default'}>
                    {mutation.data.regimen === 'No Encontrado' ? <HelpCircle className="h-4 w-4" /> : <Library className="h-4 w-4" />}
                    <AlertTitle>{mutation.data.regimen === 'No Encontrado' ? 'Régimen no determinado' : 'Régimen Fiscal Encontrado'}</AlertTitle>
                    <AlertDescription className="flex flex-col gap-2 pt-1">
                       <span>{mutation.data.message}</span>
                       <Badge variant={getStatusVariant(mutation.data.regimen)} className="w-fit">{mutation.data.regimen}</Badge>
                    </AlertDescription>
                </Alert>
            )}
            {mutation.isError && (
                 <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Error en la Consulta</AlertTitle>
                    <AlertDescription>Ocurrió un error al consultar el régimen fiscal. Inténtalo de nuevo.</AlertDescription>
                </Alert>
            )}
        </div>
    );
};
