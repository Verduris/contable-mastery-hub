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
import { MoreHorizontal, Wallet, CircleCheck, FileDown, FileText, AlertTriangle } from "lucide-react";
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
import { AccountReceivable, AccountReceivableStatus } from '@/types/receivable';
import { initialReceivables } from '@/data/receivables';
import { initialClients } from '@/data/clients';
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getStatusInfo, getBadgeVariant } from '@/utils/receivableUtils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AccountsReceivable = () => {
  const [receivables, setReceivables] = useState<AccountReceivable[]>(initialReceivables);
  const [clientFilter, setClientFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<AccountReceivableStatus | "Todos">("Todos");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<AccountReceivable | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const { toast } = useToast();

  const clientData = useMemo(() => new Map(initialClients.map(c => [c.id, c])), []);
  
  const clientTotalOutstanding = useMemo(() => {
    const totals = new Map<string, number>();
    receivables.forEach(r => {
      if (r.status !== 'Pagada') {
        const current = totals.get(r.clientId) || 0;
        totals.set(r.clientId, current + r.outstandingBalance);
      }
    });
    return totals;
  }, [receivables]);

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

  const openDetailsDialog = (receivable: AccountReceivable) => {
    setSelectedReceivable(receivable);
    setIsDetailsDialogOpen(true);
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
        
        const newPayment = {
            id: `pay-${Date.now()}`,
            date: new Date().toISOString(),
            amount: paymentAmount,
        };
        const updatedPaymentHistory = [...(r.paymentHistory || []), newPayment];

        return {
          ...r,
          paidAmount: newPaidAmount,
          outstandingBalance: newOutstandingBalance,
          status: newStatus,
          paymentHistory: updatedPaymentHistory,
        };
      }
      return r;
    }));
    toast({ title: "Cobro registrado", description: `Se ha registrado un pago por ${paymentAmount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}.` });
    setIsPaymentDialogOpen(false);
    setSelectedReceivable(null);
    setPaymentAmount(0);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Cuentas por Cobrar", 14, 16);
    
    const tableColumn = ["Cliente", "F. Vencimiento", "Saldo Pendiente", "Estatus"];
    const tableRows: any[] = [];

    filteredReceivables.forEach(r => {
      const receivableData = [
        clientData.get(r.clientId)?.name || 'N/A',
        format(parseISO(r.dueDate), 'dd/MMM/yy', { locale: es }),
        r.outstandingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
        r.status
      ];
      tableRows.push(receivableData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
    });
    
    doc.save('cuentas_por_cobrar.pdf');
    toast({ title: "PDF Exportado", description: "La tabla de cuentas por cobrar ha sido exportada." });
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
            <Button onClick={handleExportPDF} variant="outline">
                <FileDown className="mr-2" /> Exportar a PDF
            </Button>
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
                const client = clientData.get(r.clientId);
                const totalOutstanding = clientTotalOutstanding.get(r.clientId) || 0;
                const creditLimitExceeded = client && client.creditLimit && client.creditLimit > 0 && totalOutstanding > client.creditLimit;

                return (
                  <TableRow key={r.id} className={cn(r.status === 'Pagada' && 'text-muted-foreground')}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{client?.name || 'N/A'}</span>
                        {creditLimitExceeded && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertTriangle className="text-destructive" />
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
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={r.status === 'Pagada'}>
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => openDetailsDialog(r)}>
                            <FileText className="mr-2" /> Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPaymentDialog(r)}>
                            <Wallet className="mr-2" /> Registrar Cobro
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkAsPaid(r.id)}>
                            <CircleCheck className="mr-2" /> Marcar como Pagada
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
            <DialogTitle>Registrar Cobro</DialogTitle>
            <DialogDescription>
              Cliente: {selectedReceivable && clientData.get(selectedReceivable.clientId)?.name}
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
            <Button onClick={handleRecordPayment}>Guardar Cobro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Cuenta por Cobrar</DialogTitle>
            <DialogDescription>
              Cliente: {selectedReceivable && clientData.get(selectedReceivable.clientId)?.name}
              <br />
              Factura ID: {selectedReceivable?.invoiceId || 'N/A'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm">Notas Internas</h4>
              <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md min-h-[60px]">{selectedReceivable?.notes || 'No hay notas.'}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Historial de Pagos</h4>
              {selectedReceivable?.paymentHistory && selectedReceivable.paymentHistory.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReceivable.paymentHistory.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{format(parseISO(p.date), 'dd/MMM/yyyy', { locale: es })}</TableCell>
                          <TableCell className="text-muted-foreground">{p.notes || ''}</TableCell>
                          <TableCell className="text-right font-mono">{p.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay pagos registrados.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setIsDetailsDialogOpen(false); setSelectedReceivable(null); }}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default AccountsReceivable;
