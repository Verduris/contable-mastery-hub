import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountPayable, AccountPayableStatus } from '@/types/payable';
import { initialPayables } from '@/data/payables';
import { initialClients } from '@/data/clients';
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PayablesTable } from '@/components/payables/PayablesTable';
import { PaymentDialog } from '@/components/payables/PaymentDialog';
import { PayablesFilters } from '@/components/payables/PayablesFilters';
import { Button } from '@/components/ui/button';
import { FileDown, PlusCircle } from 'lucide-react';
import { AddPayableDialog, AddPayableFormData } from '@/components/payables/AddPayableDialog';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AccountsPayable = () => {
  const [payables, setPayables] = useState<AccountPayable[]>(initialPayables);
  const [supplierFilter, setSupplierFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<AccountPayableStatus | "Todos">("Todos");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<AccountPayable | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

  const handleAddPayable = (data: AddPayableFormData) => {
    const newPayable: AccountPayable = {
      id: `cxp-${Date.now()}`,
      supplierId: data.supplierId,
      issueDate: new Date(data.issueDate).toISOString(),
      dueDate: new Date(data.dueDate).toISOString(),
      totalAmount: data.totalAmount,
      paidAmount: 0,
      outstandingBalance: data.totalAmount,
      status: 'Pendiente',
      notes: data.notes,
    };

    if (differenceInDays(parseISO(newPayable.dueDate), new Date()) < 0) {
        newPayable.status = 'Vencida';
    }

    setPayables(prev => [newPayable, ...prev]);
    setIsAddDialogOpen(false);
    toast({
        title: "Cuenta por pagar registrada",
        description: "La nueva cuenta ha sido añadida exitosamente."
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = filteredPayables.map(p => [
      supplierMap.get(p.supplierId) || 'N/A',
      format(parseISO(p.issueDate), 'dd/MMM/yy', { locale: es }),
      format(parseISO(p.dueDate), 'dd/MMM/yy', { locale: es }),
      p.totalAmount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
      p.outstandingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
      p.status
    ]);

    doc.text("Reporte de Cuentas por Pagar", 14, 15);
    (doc as any).autoTable({
        head: [['Proveedor', 'F. Emisión', 'F. Vencimiento', 'Monto Total', 'Saldo Pendiente', 'Estatus']],
        body: tableData,
        startY: 20
    });

    doc.save('cuentas-por-pagar.pdf');
    toast({ title: "PDF Generado", description: "El reporte de CXP ha sido descargado." });
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
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExportPDF}><FileDown /> Exportar PDF</Button>
              <Button onClick={() => setIsAddDialogOpen(true)}><PlusCircle /> Registrar CXP</Button>
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

      <AddPayableDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        suppliers={initialClients}
        onAddPayable={handleAddPayable}
      />
    </TooltipProvider>
  );
};

export default AccountsPayable;
