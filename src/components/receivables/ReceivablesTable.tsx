
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Wallet, CircleCheck, FileText, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AccountReceivable } from '@/types/receivable';
import { Client } from '@/types/client';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getStatusInfo, getBadgeVariant } from '@/utils/receivableUtils';

interface ReceivablesTableProps {
  receivables: AccountReceivable[];
  clientTotalOutstanding: Map<string, number>;
  openDetailsDialog: (receivable: AccountReceivable) => void;
  openPaymentDialog: (receivable: AccountReceivable) => void;
  handleMarkAsPaid: (receivableId: string) => void;
}

export const ReceivablesTable = ({
  receivables,
  clientTotalOutstanding,
  openDetailsDialog,
  openPaymentDialog,
  handleMarkAsPaid
}: ReceivablesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
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
        {receivables.map((r) => {
          const statusInfo = getStatusInfo(r);
          const daysDiff = differenceInDays(parseISO(r.dueDate), new Date());
          const client = r.client;
          const totalOutstanding = clientTotalOutstanding.get(r.clientId) || 0;
          const creditLimitExceeded = client && client.creditLimit && client.creditLimit > 0 && totalOutstanding > client.creditLimit;

          return (
            <TableRow key={r.id} className={cn((r.status === 'Pagada' || r.status === 'Cancelada') && 'text-muted-foreground bg-gray-50')}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span>{client?.name || 'N/A'}</span>
                  {creditLimitExceeded && (
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Límite de crédito excedido.</p>
                        <p>Límite: {client?.creditLimit?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                        <p>Saldo Total: {totalOutstanding.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
              <TableCell>{format(parseISO(r.issueDate), 'dd/MMM/yy', { locale: es })}</TableCell>
              <TableCell>{format(parseISO(r.dueDate), 'dd/MMM/yy', { locale: es })}</TableCell>
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
              <TableCell className="text-right font-mono">{r.totalAmount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
              <TableCell className="text-right font-mono font-semibold">{r.outstandingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
              <TableCell><Badge variant={getBadgeVariant(r.status)}>{r.status}</Badge></TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={r.status === 'Pagada' || r.status === 'Cancelada'}>
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={() => openDetailsDialog(r)}>
                      <FileText className="mr-2 h-4 w-4" /> Ver Detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openPaymentDialog(r)}>
                      <Wallet className="mr-2 h-4 w-4" /> Registrar Cobro
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMarkAsPaid(r.id)}>
                      <CircleCheck className="mr-2 h-4 w-4" /> Marcar como Pagada
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
