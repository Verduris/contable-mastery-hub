import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchInvoices, addInvoice } from "@/queries/invoices";
import { fetchClients } from "@/queries/clients";
import { initialClients } from "@/data/clients";
import { Invoice, SatStatus } from "@/types/invoice";
import { Client } from "@/types/client";

import { InvoicesHeader } from "@/components/invoicing/InvoicesHeader";
import { InvoicesTable } from "@/components/invoicing/InvoicesTable";
import { Skeleton } from "@/components/ui/skeleton";

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
    mutationFn: addInvoice,
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

  const handleSaveInvoice = (newInvoice: Invoice) => {
    addInvoiceMutation.mutate({
      id: newInvoice.id,
      clientId: newInvoice.clientId,
      date: newInvoice.date,
      amount: newInvoice.amount,
      cfdiUse: newInvoice.cfdiUse,
      satStatus: newInvoice.satStatus,
      fileName: newInvoice.fileName || 'unknown.xml',
    });
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

  const handleDownloadXML = (invoice: Invoice) => {
    toast({
      variant: "default",
      title: "Funcionalidad en desarrollo",
      description: `La descarga del archivo XML "${invoice.fileName}" estará disponible pronto.`,
    });
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
          />
        )}
      </CardContent>
    </Card>
  );
};

export default Invoicing;
