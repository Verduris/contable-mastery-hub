
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { AccountPayable } from '@/types/payable';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getStatusInfo, getBadgeVariant } from '@/utils/payableUtils';
import { PayableActions } from './PayableActions';

interface PayablesTableProps {
  payables: AccountPayable[];
  supplierMap: Map<string, string>;
  onOpenPaymentDialog: (payable: AccountPayable) => void;
  onMarkAsPaid: (payableId: string) => void;
}

export const PayablesTable = ({ payables, supplierMap, onOpenPaymentDialog, onMarkAsPaid }: PayablesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Proveedor</TableHead>
          <TableHead>F. Emisión</TableHead>
          <TableHead>F. Vencimiento</TableHead>
          <TableHead className="text-center">Días</TableHead>
          <TableHead className="text-right">Monto Total</TableHead>
          <TableHead className="text-right">Saldo Pendiente</TableHead>
          <TableHead>Estatus</TableHead>
          <TableHead className="text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payables.map((p) => {
          const statusInfo = getStatusInfo(p);
          const daysDiff = differenceInDays(parseISO(p.dueDate), new Date());
          return (
            <TableRow key={p.id} className={cn(p.status === 'Pagada' && 'text-muted-foreground')}>
              <TableCell className="font-medium">{supplierMap.get(p.supplierId) || 'N/A'}</TableCell>
              <TableCell>{format(parseISO(p.issueDate), 'dd/MMM/yy', { locale: es })}</TableCell>
              <TableCell>{format(parseISO(p.dueDate), 'dd/MMM/yy', { locale: es })}</TableCell>
              <TableCell className={cn("text-center font-medium", statusInfo.colorClass)}>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <div className="flex items-center justify-center gap-2">
                      {statusInfo.icon}
                      <span>{daysDiff}</span>
                     </div>
                  </TooltipTrigger>
                  <TooltipContent>{statusInfo.tooltip}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="text-right font-mono">{p.totalAmount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
              <TableCell className="text-right font-mono font-semibold">{p.outstandingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
              <TableCell><Badge variant={getBadgeVariant(p.status)}>{p.status}</Badge></TableCell>
              <TableCell className="text-center">
                <PayableActions
                  payable={p}
                  onOpenPaymentDialog={onOpenPaymentDialog}
                  onMarkAsPaid={onMarkAsPaid}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
