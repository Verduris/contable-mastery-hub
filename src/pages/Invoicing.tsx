import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchReceivables } from "@/queries/receivables";

import { initialInvoices } from "@/data/invoices";
import { initialClients } from "@/data/clients";
import { journalEntries as initialJournalEntries } from "@/data/journalEntries";
import { Invoice, SatStatus } from "@/types/invoice";
import { Client } from "@/types/client";
import { JournalEntry } from "@/types/journal";
import { AccountReceivable } from "@/types/receivable";

import { InvoicesHeader } from "@/components/invoicing/InvoicesHeader";
import { InvoicesTable } from "@/components/invoicing/InvoicesTable";

const Invoicing = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [clients] = useState<Client[]>(initialClients);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(
    initialJournalEntries
  );
  const { data: receivablesData } = useQuery({ queryKey: ['receivables'], queryFn: fetchReceivables });
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (receivablesData) {
      setReceivables(receivablesData);
    }
  }, [receivablesData]);

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
  const journalEntryMap = useMemo(() => {
    return new Map(journalEntries.map((entry) => [entry.id, entry.number]));
  }, [journalEntries]);

  const getNextIncomeEntryNumber = () => {
    const incomeEntries = journalEntries.filter((e) => e.type === "Ingreso");
    if (incomeEntries.length === 0) return "I-001";
    const lastNum = Math.max(
      ...incomeEntries.map((e) => parseInt(e.number.split("-")[1], 10))
    );
    return `I-${(lastNum + 1).toString().padStart(3, "0")}`;
  };

  const handleSaveInvoice = (newInvoiceData: Invoice) => {
    const client = clients.find((c) => c.id === newInvoiceData.clientId);
    if (!client) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cliente no válido.",
      });
      return;
    }

    const newJournalEntryId = (journalEntries.length + 1).toString();
    const newJournalEntry: JournalEntry = {
      id: newJournalEntryId,
      number: getNextIncomeEntryNumber(),
      date: newInvoiceData.date,
      concept: `Factura ${newInvoiceData.uuid.substring(0, 8)} - ${
        client.name
      }`,
      type: "Ingreso",
      status: "Revisada",
      clientId: client.id,
      invoiceId: newInvoiceData.id,
      lines: [
        {
          id: `${newJournalEntryId}-1`,
          accountId: client.associatedAccountId || "3",
          description: `Factura ${newInvoiceData.uuid.substring(0, 8)}`,
          debit: newInvoiceData.amount,
          credit: 0,
        },
        {
          id: `${newJournalEntryId}-2`,
          accountId: "6", // Ingresos por Servicios
          description: `Ingresos por factura ${newInvoiceData.uuid.substring(
            0,
            8
          )}`,
          debit: 0,
          credit: newInvoiceData.amount,
        },
      ],
    };

    setJournalEntries((prev) => [...prev, newJournalEntry]);

    const invoiceWithJournalId = {
      ...newInvoiceData,
      journalEntryId: newJournalEntryId,
    };
    setInvoices((prev) => [invoiceWithJournalId, ...prev]);

    // Create corresponding Account Receivable
    const newReceivable: AccountReceivable = {
      id: `cxc-${receivables.length + 1}`,
      clientId: newInvoiceData.clientId,
      invoiceId: newInvoiceData.id,
      issueDate: newInvoiceData.date,
      dueDate: new Date(
        new Date(newInvoiceData.date).setDate(
          new Date(newInvoiceData.date).getDate() + (client.creditDays || 30)
        )
      ).toISOString(),
      totalAmount: newInvoiceData.amount,
      paidAmount: 0,
      outstandingBalance: newInvoiceData.amount,
      status: "Pendiente",
      notes: `Generado desde factura ${newInvoiceData.uuid.substring(0, 8)}...`,
    };
    setReceivables((prev) => [...prev, newReceivable]);

    setIsDialogOpen(false);
    toast({
      title: "¡Factura Registrada!",
      description: `La factura ${newInvoiceData.uuid.substring(
        0,
        8
      )}... ha sido registrada, se ha creado la póliza ${
        newJournalEntry.number
      } y la cuenta por cobrar correspondiente.`,
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
        <InvoicesTable
          invoices={filteredInvoices}
          clientMap={clientMap}
          journalEntryMap={journalEntryMap}
          onDownloadXML={handleDownloadXML}
          onDownloadPDF={handleDownloadPDF}
        />
      </CardContent>
    </Card>
  );
};

export default Invoicing;
