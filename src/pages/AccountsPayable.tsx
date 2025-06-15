
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountPayable, AccountPayableStatus } from '@/types/payable';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPayables, addPayable, recordPayablePayment, markPayableAsPaid } from '@/queries/payables';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const AccountsPayable = () => {
  const queryClient = useQueryClient();
  const [supplierFilter, setSupplierFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<AccountPayableStatus | "Todos">("Todos");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<AccountPayable | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { toast } = useToast();
  
  const { data: payables = [], isLoading } = useQuery({
    queryKey: ['payables'],
    queryFn: fetchPayables,
  });

  useEffect(() => {
    const channel = supabase
      .channel('realtime-payables')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts_payable' }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['payables'] });
        }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payable_payments' }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['payables'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const supplierMap = useMemo(() => new Map(initialClients.map(c => [c.id, c.name])), []);

  const filteredPayables = useMemo(() => {
    return payables.filter(p => {
      const supplierMatch = supplierFilter === 'Todos' || p.supplierId === supplierFilter;
      const statusMatch = statusFilter === 'Todos' || p.status === statusFilter;
      return supplierMatch && statusMatch;
    }).sort((a, b) => differenceInDays(parseISO(a.dueDate), parseISO(b.dueDate)));
  }, [payables, supplierFilter, statusFilter]);
  
  const markAsPaidMutation = useMutation({
    mutationFn: markPayableAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      toast({ title: "Cuenta marcada como pagada", description: "El estado de la cuenta ha sido actualizado." });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: "Error", description: error.message });
    }
  });

  const handleMarkAsPaid = (payableId: string) => {
    markAsPaidMutation.mutate(payableId);
  };

  const openPaymentDialog = (payable: AccountPayable) => {
    setSelectedPayable(payable);
    setIsPaymentDialogOpen(true);
  };

  const recordPaymentMutation = useMutation({
    mutationFn: recordPayablePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      toast({ title: "Pago registrado", description: `El pago ha sido registrado.` });
      setIsPaymentDialogOpen(false);
      setSelectedPayable(null);
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: "Error", description: error.message });
    }
  });

  const handleRecordPayment = (paymentAmount: number) => {
    if (!selectedPayable || paymentAmount <= 0) return;
    recordPaymentMutation.mutate({ payableId: selectedPayable.id, amount: paymentAmount });
  };

  const addPayableMutation = useMutation({
    mutationFn: addPayable,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['payables'] });
        setIsAddDialogOpen(false);
        toast({
            title: "Cuenta por pagar registrada",
            description: "La nueva cuenta ha sido añadida exitosamente."
        });
    },
    onError: (error) => {
        toast({ variant: 'destructive', title: "Error", description: error.message });
    }
  });

  const handleAddPayable = (data: AddPayableFormData) => {
    addPayableMutation.mutate(data);
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
              <Button variant="outline" onClick={handleExportPDF}><FileDown className="mr-2 h-4 w-4" /> Exportar PDF</Button>
              <Button onClick={() => setIsAddDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Registrar CXP</Button>
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
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <PayablesTable 
              payables={filteredPayables}
              supplierMap={supplierMap}
              onOpenPaymentDialog={openPaymentDialog}
              onMarkAsPaid={handleMarkAsPaid}
            />
          )}
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
