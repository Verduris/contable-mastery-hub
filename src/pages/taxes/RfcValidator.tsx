
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import { validateRfc } from '@/utils/rfcValidator';

export const RfcValidator = () => {
    const [rfc, setRfc] = useState('');
    
    const mutation = useMutation({
        mutationFn: validateRfc
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rfc) {
            mutation.mutate(rfc);
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    placeholder="Introduce un RFC para validar"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    className="max-w-xs"
                />
                <Button type="submit" disabled={mutation.isPending || !rfc}>
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Validar RFC
                </Button>
            </form>
            {mutation.isSuccess && (
                <Alert variant={mutation.data.isValid ? 'default' : 'destructive'}>
                    {mutation.data.isValid ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}
                    <AlertTitle>{mutation.data.isValid ? 'RFC Válido' : 'RFC Inválido'}</AlertTitle>
                    <AlertDescription>{mutation.data.message}</AlertDescription>
                </Alert>
            )}
            {mutation.isError && (
                 <Alert variant="destructive">
                    <ShieldX className="h-4 w-4" />
                    <AlertTitle>Error de Validación</AlertTitle>
                    <AlertDescription>Ocurrió un error al validar el RFC. Inténtalo de nuevo.</AlertDescription>
                </Alert>
            )}
        </div>
    );
};
