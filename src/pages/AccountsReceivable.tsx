
import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountReceivable, AccountReceivableStatus } from '@/types/receivable';
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ReceivablesHeader } from '@/components/receivables/ReceivablesHeader';
import { ReceivablesTable } from '@/components/receivables/ReceivablesTable';
import { PaymentDialog } from '@/components/receivables/PaymentDialog';
import { DetailsDialog } from '@/components/receivables/DetailsDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReceivables, recordPayment, markAsPaid } from '@/queries/receivables';
import { fetchClients } from '@/queries/clients';
import { Client } from '@/types/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const AccountsReceivable = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [clientFilter, setClientFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<AccountReceivableStatus | "Todos">("Todos");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<AccountReceivable | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const { data: receivables = [], isLoading: isLoadingReceivables, isError: isReceivablesError, error: receivablesError } = useQuery({
    queryKey: ['receivables'],
    queryFn: fetchReceivables,
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });
  
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

  const markAsPaidMutation = useMutation({
    mutationFn: markAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      toast({ title: "Cuenta marcada como pagada", description: "El estado de la cuenta ha sido actualizado." });
    },
    onError: (error: Error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const recordPaymentMutation = useMutation({
    mutationFn: ({ receivableId, amount, date }: { receivableId: string, amount: number, date: string }) => 
        recordPayment(receivableId, amount, date),
    onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['receivables'] });
        toast({ title: "Cobro registrado", description: `Se ha registrado un pago por ${variables.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}.` });
        handlePaymentDialogClose(false);
    },
    onError: (error: Error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleMarkAsPaid = (receivableId: string) => {
    markAsPaidMutation.mutate(receivableId);
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

  const handlePaymentDialogClose = (isOpen: boolean) => {
    setIsPaymentDialogOpen(isOpen);
    if (!isOpen) {
      setSelectedReceivable(null);
      setPaymentAmount(0);
    }
  }

  const handleRecordPayment = () => {
    if (!selectedReceivable || paymentAmount <= 0) return;
    recordPaymentMutation.mutate({
      receivableId: selectedReceivable.id,
      amount: paymentAmount,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Cuentas por Cobrar", 14, 16);
    
    const tableColumn = ["Cliente", "F. Vencimiento", "Saldo Pendiente", "Estatus"];
    const tableRows: any[] = [];

    filteredReceivables.forEach(r => {
      const receivableData = [
        r.client?.name || 'N/A',
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
  
  const handleDetailsDialogClose = (isOpen: boolean) => {
    setIsDetailsDialogOpen(isOpen);
    if (!isOpen) {
      setSelectedReceivable(null);
    }
  }

  const renderTableContent = () => {
    if (isLoadingReceivables) {
      return (
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-24" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }

    if (isReceivablesError) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={8} className="py-10 text-center">
              <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error al Cargar Cuentas</AlertTitle>
                <AlertDescription>
                  {receivablesError instanceof Error ? receivablesError.message : "Ocurrió un error inesperado."}
                </AlertDescription>
              </Alert>
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }
    
    if (filteredReceivables.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
              No hay cuentas por cobrar que coincidan con los filtros seleccionados.
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <ReceivablesTable 
        receivables={filteredReceivables}
        clientTotalOutstanding={clientTotalOutstanding}
        openDetailsDialog={openDetailsDialog}
        openPaymentDialog={openPaymentDialog}
        handleMarkAsPaid={handleMarkAsPaid}
      />
    );
  };

  return (
    <TooltipProvider>
      <Card>
        <ReceivablesHeader 
          clients={clients}
          isLoadingClients={isLoadingClients}
          clientFilter={clientFilter}
          setClientFilter={setClientFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          handleExportPDF={handleExportPDF}
        />
        <CardContent>
          {renderTableContent()}
        </CardContent>
      </Card>

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onOpenChange={handlePaymentDialogClose}
        receivable={selectedReceivable}
        paymentAmount={paymentAmount}
        onPaymentAmountChange={setPaymentAmount}
        onRecordPayment={handleRecordPayment}
      />

      <DetailsDialog 
        isOpen={isDetailsDialogOpen}
        onOpenChange={handleDetailsDialogClose}
        receivable={selectedReceivable}
      />
    </TooltipProvider>
  );
};

export default AccountsReceivable;
