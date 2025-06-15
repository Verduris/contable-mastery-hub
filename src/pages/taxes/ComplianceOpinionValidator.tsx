
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, FileDown, ShieldAlert } from 'lucide-react';
import { getComplianceOpinion } from '@/utils/complianceOpinionValidator';
import { Badge } from '@/components/ui/badge';
import { ComplianceStatus } from '@/types/fiscal';

export const ComplianceOpinionValidator = () => {
    const [rfc, setRfc] = useState('');

    const mutation = useMutation({
        mutationFn: getComplianceOpinion,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rfc) {
            mutation.mutate(rfc);
        }
    };
    
    const getStatusInfo = (status: ComplianceStatus): {
        variant: "default" | "destructive" | "success" | "warning";
        icon: React.ReactNode;
        title: string;
    } => {
        switch (status) {
            case 'Positiva':
                return { variant: 'success', icon: <CheckCircle2 className="h-4 w-4" />, title: 'Opinión Positiva' };
            case 'Negativa':
                return { variant: 'destructive', icon: <XCircle className="h-4 w-4" />, title: 'Opinión Negativa' };
            case 'En Proceso de Aclaración':
                return { variant: 'warning', icon: <AlertTriangle className="h-4 w-4" />, title: 'En Proceso de Aclaración' };
            case 'No Encontrada':
                return { variant: 'destructive', icon: <XCircle className="h-4 w-4" />, title: 'No Encontrada' };
            default:
                return { variant: 'default', icon: <AlertTriangle className="h-4 w-4" />, title: 'Estatus Desconocido' };
        }
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    placeholder="Introduce un RFC para consultar"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    className="max-w-xs"
                    aria-label="RFC para consulta de opinión de cumplimiento"
                />
                <Button type="submit" disabled={mutation.isPending || !rfc}>
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Consultar Opinión
                </Button>
            </form>
            {mutation.isSuccess && (
                <Alert variant={mutation.data.status === 'Negativa' || mutation.data.status === 'No Encontrada' ? 'destructive' : 'default'}>
                    {getStatusInfo(mutation.data.status).icon}
                    <AlertTitle>{getStatusInfo(mutation.data.status).title}</AlertTitle>
                    <AlertDescription className="flex flex-col gap-2 pt-1">
                       <span>{mutation.data.message}</span>
                       <div className="flex items-center gap-2">
                         <Badge variant={getStatusInfo(mutation.data.status).variant} className="w-fit">{mutation.data.status}</Badge>
                         {mutation.data.pdfUrl && (
                             <a href={mutation.data.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                                 <Button variant="outline" size="sm">
                                     <FileDown className="mr-2 h-3 w-3" />
                                     Descargar Acuse
                                 </Button>
                             </a>
                         )}
                       </div>
                    </AlertDescription>
                </Alert>
            )}
            {mutation.isError && (
                 <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Error en la Consulta</AlertTitle>
                    <AlertDescription>Ocurrió un error al consultar la opinión de cumplimiento. Inténtalo de nuevo.</AlertDescription>
                </Alert>
            )}
        </div>
    );
};
