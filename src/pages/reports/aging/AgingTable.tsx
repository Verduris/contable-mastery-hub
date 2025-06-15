
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AgingReportItem } from "@/hooks/reports/useAgingReport";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface AgingTableProps {
    data: AgingReportItem[];
}

const getStatusAppearance = (status: AgingReportItem['status']): { colorClass: string, variant: "default" | "secondary" | "destructive" | "outline" } => {
    switch (status) {
        case 'Vencida':
            return { colorClass: 'text-destructive', variant: 'destructive' };
        case 'Próxima a Vencer':
            return { colorClass: 'text-yellow-600 dark:text-yellow-500', variant: 'secondary' };
        case 'Pagada':
            return { colorClass: 'text-green-600 dark:text-green-500', variant: 'default' };
        case 'Pendiente':
        default:
            return { colorClass: 'text-foreground', variant: 'outline' };
    }
};

export const AgingTable = ({ data }: AgingTableProps) => {
    return (
        <div className="px-6 pb-6">
             <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Tipo</TableHead>
                            <TableHead>Cliente/Proveedor</TableHead>
                            <TableHead>F. Vencimiento</TableHead>
                            <TableHead className="text-center">Días</TableHead>
                            <TableHead className="text-right">Saldo Pendiente</TableHead>
                            <TableHead>Estatus</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No hay datos para mostrar con los filtros seleccionados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => {
                                const { colorClass, variant } = getStatusAppearance(item.status);
                                return (
                                    <TableRow key={item.id} className={cn(item.status === 'Pagada' && 'text-muted-foreground')}>
                                        <TableCell>
                                            <Badge variant={item.type === 'CXC' ? 'outline' : 'secondary'}>{item.type}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.entityName}</TableCell>
                                        <TableCell className={cn("font-medium", colorClass)}>{format(parseISO(item.dueDate), 'dd/MMM/yy', { locale: es })}</TableCell>
                                        <TableCell className={cn("text-center font-medium", colorClass)}>{item.days}</TableCell>
                                        <TableCell className="text-right font-mono">{item.outstandingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                                        <TableCell>
                                            <Badge variant={variant} className={cn(status === 'Pagada' && 'bg-green-500/20 text-green-700 border-green-500/20', status === 'Próxima a Vencer' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20')}>{item.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
