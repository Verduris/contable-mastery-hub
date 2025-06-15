
import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountReceivable, AccountReceivableStatus } from '@/types/receivable';
import { initialReceivables } from '@/data/receivables';
import { initialClients } from '@/data/clients';
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ReceivablesHeader } from '@/components/receivables/ReceivablesHeader';
import { ReceivablesTable } from '@/components/receivables/ReceivablesTable';
import { PaymentDialog } from '@/components/receivables/PaymentDialog';
import { DetailsDialog } from '@/components/receivables/DetailsDialog';

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

  const handlePaymentDialogClose = (isOpen: boolean) => {
    setIsPaymentDialogOpen(isOpen);
    if (!isOpen) {
      setSelectedReceivable(null);
      setPaymentAmount(0);
    }
  }

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
    handlePaymentDialogClose(false);
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
  
  const handleDetailsDialogClose = (isOpen: boolean) => {
    setIsDetailsDialogOpen(isOpen);
    if (!isOpen) {
      setSelectedReceivable(null);
    }
  }

  return (
    <TooltipProvider>
      <Card>
        <ReceivablesHeader 
          clientFilter={clientFilter}
          setClientFilter={setClientFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          handleExportPDF={handleExportPDF}
        />
        <CardContent>
          <ReceivablesTable 
            receivables={filteredReceivables}
            clientData={clientData}
            clientTotalOutstanding={clientTotalOutstanding}
            openDetailsDialog={openDetailsDialog}
            openPaymentDialog={openPaymentDialog}
            handleMarkAsPaid={handleMarkAsPaid}
          />
        </CardContent>
      </Card>

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onOpenChange={handlePaymentDialogClose}
        receivable={selectedReceivable}
        clientData={clientData}
        paymentAmount={paymentAmount}
        onPaymentAmountChange={setPaymentAmount}
        onRecordPayment={handleRecordPayment}
      />

      <DetailsDialog 
        isOpen={isDetailsDialogOpen}
        onOpenChange={handleDetailsDialogClose}
        receivable={selectedReceivable}
        clientData={clientData}
      />
    </TooltipProvider>
  );
};

export default AccountsReceivable;
