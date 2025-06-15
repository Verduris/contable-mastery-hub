
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountPayable, AccountPayableStatus } from '@/types/payable';
import { initialPayables } from '@/data/payables';
import { initialClients } from '@/data/clients';
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, parseISO } from 'date-fns';
import { PayablesTable } from '@/components/payables/PayablesTable';
import { PaymentDialog } from '@/components/payables/PaymentDialog';
import { PayablesFilters } from '@/components/payables/PayablesFilters';

const AccountsPayable = () => {
  const [payables, setPayables] = useState<AccountPayable[]>(initialPayables);
  const [supplierFilter, setSupplierFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<AccountPayableStatus | "Todos">("Todos");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<AccountPayable | null>(null);

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
    setIsPaymentDialogOpen(true);
  };

  const handleRecordPayment = (paymentAmount: number) => {
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
          <PayablesFilters 
            supplierFilter={supplierFilter}
            onSupplierFilterChange={setSupplierFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            suppliers={initialClients}
          />
        </CardHeader>
        <CardContent>
          <PayablesTable 
            payables={filteredPayables}
            supplierMap={supplierMap}
            onOpenPaymentDialog={openPaymentDialog}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </CardContent>
      </Card>

      <PaymentDialog 
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        selectedPayable={selectedPayable}
        supplierMap={supplierMap}
        onRecordPayment={handleRecordPayment}
      />
    </TooltipProvider>
  );
};

export default AccountsPayable;
