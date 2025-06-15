
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CircleX, CircleAlert, CircleCheck, MoreHorizontal, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccountReceivable, AccountReceivableStatus } from '@/types/receivable';
import { initialReceivables } from '@/data/receivables';
import { initialClients } from '@/data/clients';
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const AccountsReceivable = () => {
  const [receivables, setReceivables] = useState<AccountReceivable[]>(initialReceivables);
  const [clientFilter, setClientFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<AccountReceivableStatus | "Todos">("Todos");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<AccountReceivable | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const { toast } = useToast();

  const clientMap = useMemo(() => new Map(initialClients.map(c => [c.id, c.name])), []);

  const filteredReceivables = useMemo(() => {
    return receivables.filter(r => {
      const clientMatch = clientFilter === 'Todos' || r.clientId === clientFilter;
      const statusMatch = statusFilter === 'Todos' || r.status === statusFilter;
      return clientMatch && statusMatch;
    }).sort((a, b) => differenceInDays(parseISO(a.dueDate), parseISO(b.dueDate)));
  }, [receivables, clientFilter, statusFilter]);

  const handleMarkAsPaid = (receivableId: string) => {
    setReceivables(prev => prev.map(r => {
      if (r.id === receivableId) {
        return { ...r, status: 'Pagada', paidAmount: r.totalAmount, outstandingBalance: 0 };
      }
      return r;
    }));
    toast({ title: "Cuenta marcada como pagada", description: "El estado de la cuenta ha sido actualizado." });
  };

  const openPaymentDialog = (receivable: AccountReceivable) => {
    setSelectedReceivable(receivable);
    setPaymentAmount(receivable.outstandingBalance);
    setIsPaymentDialogOpen(true);
  };

  const handleRecordPayment = () => {
    if (!selectedReceivable || paymentAmount <= 0) return;

    setReceivables(prev => prev.map(r => {
      if (r.id === selectedReceivable.id) {
        const newPaidAmount = r.paidAmount + paymentAmount;
        const newOutstandingBalance = r.totalAmount - newPaidAmount;
        let newStatus: AccountReceivableStatus = 'Parcialmente Pagada';
        if (newOutstandingBalance <= 0) {
          newStatus = 'Pagada';
        } else if (differenceInDays(new Date(), parseISO(r.dueDate)) > 0) {
            newStatus = 'Vencida';
        }
        return {
          ...r,
          paidAmount: newPaidAmount,
          outstandingBalance: newOutstandingBalance,
          status: newStatus,
        };
      }
      return r;
    }));
    toast({ title: "Abono registrado", description: `Se ha registrado un pago por ${paymentAmount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}.` });
    setIsPaymentDialogOpen(false);
    setSelectedReceivable(null);
    setPaymentAmount(0);
  };

  const getStatusInfo = (receivable: AccountReceivable): { icon: React.ReactNode, tooltip: string, colorClass: string } => {
    const daysDiff = differenceInDays(parseISO(receivable.dueDate), new Date());
    
    if (receivable.status === 'Pagada') {
      return { icon: <CircleCheck className="h-4 w-4 text-green-500" />, tooltip: 'Pagada', colorClass: 'text-green-500' };
    }
    if (receivable.status === 'Vencida' || daysDiff < 0) {
      return { icon: <CircleX className="h-4 w-4 text-destructive" />, tooltip: `Vencida por ${Math.abs(daysDiff)} días`, colorClass: 'text-destructive' };
    }
    if (daysDiff <= 5) {
      return { icon: <CircleAlert className="h-4 w-4 text-yellow-500" />, tooltip: `Vence en ${daysDiff} días`, colorClass: 'text-yellow-500' };
    }
    return { icon: null, tooltip: `Vence en ${daysDiff} días`, colorClass: '' };
  };

  const getBadgeVariant = (status: AccountReceivableStatus) => {
    switch (status) {
      case 'Pagada': return 'default';
      case 'Vencida': return 'destructive';
      case 'Parcialmente Pagada': return 'secondary';
      case 'Pendiente': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Cuentas por Cobrar (CXC)</CardTitle>
              <CardDescription>Gestiona y da seguimiento a los cobros pendientes.</CardDescription>
            </div>
          </div>
          <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="Filtrar por cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los clientes</SelectItem>
                {initialClients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los estatus</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Parcialmente Pagada">Parcialmente Pagada</SelectItem>
                <SelectItem value="Vencida">Vencida</SelectItem>
                <SelectItem value="Pagada">Pagada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
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
              {filteredReceivables.map((r) => {
                const statusInfo = getStatusInfo(r);
                const daysDiff = differenceInDays(parseISO(r.dueDate), new Date());
                return (
                  <TableRow key={r.id} className={cn(r.status === 'Pagada' && 'text-muted-foreground')}>
                    <TableCell className="font-medium">{clientMap.get(r.clientId) || 'N/A'}</TableCell>
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
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={r.status === 'Pagada'}>
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPaymentDialog(r)}>
                            <Wallet className="mr-2 h-4 w-4" /> Registrar Abono
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
        </CardContent>
      </Card>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Abono</DialogTitle>
            <DialogDescription>
              Cliente: {selectedReceivable && clientMap.get(selectedReceivable.clientId)}
              <br />
              Saldo pendiente: {selectedReceivable?.outstandingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="payment-amount" className="text-right">Monto</label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Math.min(Number(e.target.value), selectedReceivable?.outstandingBalance || 0))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPaymentDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleRecordPayment}>Guardar Pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default AccountsReceivable;
