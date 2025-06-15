import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { fetchInvoices, addInvoice, uploadInvoiceFile, cancelInvoice } from "@/queries/invoices";
import { fetchClients } from "@/queries/clients";
import { initialClients } from "@/data/clients";
import { Invoice, SatStatus } from "@/types/invoice";
import { Client } from "@/types/client";

import { InvoicesHeader } from "@/components/invoicing/InvoicesHeader";
import { InvoicesTable } from "@/components/invoicing/InvoicesTable";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const Invoicing = () => {
  const queryClient = useQueryClient();
  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({ 
    queryKey: ['invoices'], 
    queryFn: fetchInvoices 
  });
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({ 
    queryKey: ['clients'], 
    queryFn: fetchClients 
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const [filters, setFilters] = useState<{
    client: string;
    status: SatStatus | "Todos";
    uuid: string;
  }>({
    client: "Todos",
    status: "Todos",
    uuid: "",
  });

  const clientMap = useMemo(
    () => new Map(clients.map((client) => [client.id, client.name])),
    [clients]
  );
  
  const addInvoiceMutation = useMutation({
    mutationFn: async ({ invoice, file }: { invoice: Invoice, file: File }) => {
        const filePath = await uploadInvoiceFile(file, invoice.id);
        
        await addInvoice({
            id: invoice.id,
            clientId: invoice.clientId,
            date: invoice.date,
            amount: invoice.amount,
            cfdiUse: invoice.cfdiUse,
            satStatus: invoice.satStatus,
            fileName: filePath,
        });
    },
    onSuccess: () => {
        toast({
            title: "¡Factura Registrada!",
            description: `La factura ha sido registrada y se ha creado la póliza y la cuenta por cobrar correspondiente.`
        });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['receivables'] });
        queryClient.invalidateQueries({ queryKey: ['payables'] });
        queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
        setIsDialogOpen(false);
    },
    onError: (error: Error) => {
        toast({
            variant: "destructive",
            title: "Error al registrar factura",
            description: error.message,
        });
    }
  });

  const cancelInvoiceMutation = useMutation({
    mutationFn: cancelInvoice,
    onSuccess: () => {
        toast({
            title: "¡Factura Cancelada!",
            description: "La factura y sus registros asociados han sido cancelados."
        });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['receivables'] });
        queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
        setIsCancelConfirmOpen(false);
        setInvoiceToCancel(null);
    },
    onError: (error: Error) => {
        toast({
            variant: "destructive",
            title: "Error al cancelar factura",
            description: error.message,
        });
        setIsCancelConfirmOpen(false);
        setInvoiceToCancel(null);
    }
  });

  const handleSaveInvoice = (newInvoice: Invoice, file: File) => {
    addInvoiceMutation.mutate({ invoice: newInvoice, file });
  };

  const handleOpenCancelDialog = (invoice: Invoice) => {
    setInvoiceToCancel(invoice);
    setIsCancelConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    if (invoiceToCancel) {
        cancelInvoiceMutation.mutate(invoiceToCancel.id);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((invoice) => {
        const clientMatch =
          filters.client === "Todos" || invoice.clientId === filters.client;
        const statusMatch =
          filters.status === "Todos" || invoice.satStatus === filters.status;
        const uuidMatch = invoice.uuid
          .toLowerCase()
          .includes(filters.uuid.toLowerCase().trim());
        return clientMatch && statusMatch && uuidMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [invoices, filters]);

  const handleDownloadXML = async (invoice: Invoice) => {
    if (!invoice.fileName) {
      toast({
        variant: "destructive",
        title: "Archivo no encontrado",
        description: "Esta factura no tiene un archivo XML asociado.",
      });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('invoice_files')
        .download(invoice.fileName);

      if (error) {
        throw error;
      }

      const blob = new Blob([data], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const originalFileName = invoice.fileName.split('/').pop();
      a.download = originalFileName || 'factura.xml';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast({
          title: "XML Descargado",
          description: "El archivo XML de la factura ha sido descargado.",
      });

    } catch (error: any) {
      console.error("Error downloading XML:", error);
      toast({
        variant: "destructive",
        title: "Error al descargar",
        description: error.message || "No se pudo descargar el archivo XML.",
      });
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    const clientName = clientMap.get(invoice.clientId) || "N/A";

    doc.setFontSize(16);
    doc.text("Factura (CFDI)", 14, 22);

    (doc as any).autoTable({
      startY: 30,
      head: [["Concepto", "Valor"]],
      body: [
        ["Cliente", clientName],
        ["Folio Fiscal (UUID)", invoice.uuid],
        [
          "Fecha de Emisión",
          format(new Date(invoice.date), "dd/MMM/yyyy", { locale: es }),
        ],
        [
          "Monto Total",
          invoice.amount.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
          }),
        ],
        ["Estatus SAT", invoice.satStatus],
        ["Uso CFDI", invoice.cfdiUse],
      ],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      didDrawPage: (data: any) => {
        doc.setFontSize(10);
        doc.text(
          "Página " + (doc.internal as any).getNumberOfPages(),
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    });

    doc.save(`Factura-${invoice.uuid.substring(0, 8)}.pdf`);

    toast({
      title: "PDF Generado",
      description: `Se ha descargado el PDF para la factura.`,
    });
  };

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const isLoading = isLoadingInvoices || isLoadingClients;

  return (
    <Card>
      <InvoicesHeader
        clients={clients}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isDialogOpen={isDialogOpen}
        onDialogOpenChange={setIsDialogOpen}
        onSaveInvoice={handleSaveInvoice}
      />
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <InvoicesTable
            invoices={filteredInvoices}
            clientMap={clientMap}
            onDownloadXML={handleDownloadXML}
            onDownloadPDF={handleDownloadPDF}
            onCancelInvoice={handleOpenCancelDialog}
          />
        )}
      </CardContent>
       <AlertDialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres cancelar esta factura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se actualizará el estatus de la factura a "Cancelada", 
              se anulará la póliza contable asociada y se cancelará la cuenta por cobrar correspondiente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setInvoiceToCancel(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} disabled={cancelInvoiceMutation.isPending}>
              {cancelInvoiceMutation.isPending ? "Cancelando..." : "Sí, cancelar factura"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default Invoicing;
