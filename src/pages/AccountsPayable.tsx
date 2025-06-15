
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
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccountPayable, AccountPayableStatus } from '@/types/payable';
import { initialPayables } from '@/data/payables';
import { initialClients } from '@/data/clients';
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const AccountsPayable = () => {
  const [payables, setPayables] = useState<AccountPayable[]>(initialPayables);
  const [supplierFilter, setSupplierFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<AccountPayableStatus | "Todos">("Todos");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<AccountPayable | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const { toast } = useToast();

  const supplierMap = useMemo(() => new Map(initialClients.map(c => [c.id, c.name])), []);

  const filteredPayables = useMemo(() => {
    return payables.filter(p => {
      const supplierMatch = supplierFilter === 'Todos' || p.supplierId === supplierFilter;
      const statusMatch = statusFilter === 'Todos' || p.status === statusFilter;
      return supplierMatch && statusMatch;
    }).sort((a, b) => differenceInDays(parseISO(a.dueDate), parseISO(b.dueDate)));
  }, [payables, supplierFilter, statusFilter]);

  const handleMarkAsPaid = (payableId: string) => {
    setPayables(prev => prev.map(p => {
      if (p.id === payableId) {
        return { ...p, status: 'Pagada', paidAmount: p.totalAmount, outstandingBalance: 0 };
      }
      return p;
    }));
    toast({ title: "Cuenta marcada como pagada", description: "El estado de la cuenta ha sido actualizado." });
  };

  const openPaymentDialog = (payable: AccountPayable) => {
    setSelectedPayable(payable);
    setPaymentAmount(payable.outstandingBalance);
    setIsPaymentDialogOpen(true);
  };

  const handleRecordPayment = () => {
    if (!selectedPayable || paymentAmount <= 0) return;

    setPayables(prev => prev.map(p => {
      if (p.id === selectedPayable.id) {
        const newPaidAmount = p.paidAmount + paymentAmount;
        const newOutstandingBalance = p.totalAmount - newPaidAmount;
        let newStatus: AccountPayableStatus = 'Parcialmente Pagada';
        if (newOutstandingBalance <= 0) {
          newStatus = 'Pagada';
        } else if (differenceInDays(new Date(), parseISO(p.dueDate)) > 0) {
            newStatus = 'Vencida';
        }
        return {
          ...p,
          paidAmount: newPaidAmount,
          outstandingBalance: newOutstandingBalance,
          status: newStatus,
        };
      }
      return p;
    }));
    toast({ title: "Pago registrado", description: `Se ha registrado un pago por ${paymentAmount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}.` });
    setIsPaymentDialogOpen(false);
    setSelectedPayable(null);
    setPaymentAmount(0);
  };

  const getStatusInfo = (payable: AccountPayable): { icon: React.ReactNode, tooltip: string, colorClass: string } => {
    const daysDiff = differenceInDays(parseISO(payable.dueDate), new Date());
    
    if (payable.status === 'Pagada') {
      return { icon: <CircleCheck className="h-4 w-4 text-green-500" />, tooltip: 'Pagada', colorClass: 'text-green-500' };
    }
    if (payable.status === 'Vencida' || daysDiff < 0) {
      return { icon: <CircleX className="h-4 w-4 text-destructive" />, tooltip: `Vencida por ${Math.abs(daysDiff)} días`, colorClass: 'text-destructive' };
    }
    if (daysDiff <= 5) {
      return { icon: <CircleAlert className="h-4 w-4 text-yellow-500" />, tooltip: `Vence en ${daysDiff} días`, colorClass: 'text-yellow-500' };
    }
    return { icon: null, tooltip: `Vence en ${daysDiff} días`, colorClass: '' };
  };

  const getBadgeVariant = (status: AccountPayableStatus) => {
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
              <CardTitle>Cuentas por Pagar (CXP)</CardTitle>
              <CardDescription>Gestiona y da seguimiento a los pagos a proveedores.</CardDescription>
            </div>
          </div>
          <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="Filtrar por proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los proveedores</SelectItem>
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
              {filteredPayables.map((p) => {
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={p.status === 'Pagada'}>
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPaymentDialog(p)}>
                            <Wallet className="mr-2 h-4 w-4" /> Registrar Pago
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkAsPaid(p.id)}>
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
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Proveedor: {selectedPayable && supplierMap.get(selectedPayable.supplierId)}
              <br />
              Saldo pendiente: {selectedPayable?.outstandingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="payment-amount" className="text-right">Monto</label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Math.min(Number(e.target.value), selectedPayable?.outstandingBalance || 0))}
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

export default AccountsPayable;
