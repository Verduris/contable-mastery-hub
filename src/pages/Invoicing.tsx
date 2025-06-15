
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { initialInvoices } from "@/data/invoices";
import { initialClients } from "@/data/clients";
import { journalEntries as initialJournalEntries } from "@/data/journalEntries";
import { Invoice } from "@/types/invoice";
import { Client } from "@/types/client";
import { JournalEntry } from "@/types/journal";

import { AddInvoiceForm } from "@/components/AddInvoiceForm";

const Invoicing = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [clients] = useState<Client[]>(initialClients);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialJournalEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const clientMap = new Map(clients.map(client => [client.id, client.name]));
  const journalEntryMap = new Map(journalEntries.map(entry => [entry.id, entry.number]));

  const getNextIncomeEntryNumber = () => {
    const incomeEntries = journalEntries.filter(e => e.type === 'Ingreso');
    if (incomeEntries.length === 0) return "I-001";
    const lastNum = Math.max(...incomeEntries.map(e => parseInt(e.number.split('-')[1], 10)));
    return `I-${(lastNum + 1).toString().padStart(3, '0')}`;
  };

  const handleSaveInvoice = (newInvoiceData: Invoice) => {
    const client = clients.find(c => c.id === newInvoiceData.clientId);
    if (!client) {
        toast({ variant: "destructive", title: "Error", description: "Cliente no válido."});
        return;
    }

    const newJournalEntryId = (journalEntries.length + 1).toString();
    const newJournalEntry: JournalEntry = {
        id: newJournalEntryId,
        number: getNextIncomeEntryNumber(),
        date: newInvoiceData.date,
        concept: `Factura ${newInvoiceData.uuid.substring(0, 8)} - ${client.name}`,
        type: 'Ingreso',
        status: 'Revisada',
        clientId: client.id,
        invoiceId: newInvoiceData.id,
        lines: [
            {
                id: `${newJournalEntryId}-1`,
                accountId: client.associatedAccountId || '3',
                description: `Factura ${newInvoiceData.uuid.substring(0, 8)}`,
                debit: newInvoiceData.amount,
                credit: 0
            },
            {
                id: `${newJournalEntryId}-2`,
                accountId: '6', // Ingresos por Servicios
                description: `Ingresos por factura ${newInvoiceData.uuid.substring(0, 8)}`,
                debit: 0,
                credit: newInvoiceData.amount
            }
        ]
    };
    
    setJournalEntries(prev => [...prev, newJournalEntry]);
    journalEntryMap.set(newJournalEntry.id, newJournalEntry.number);

    const invoiceWithJournalId = { ...newInvoiceData, journalEntryId: newJournalEntryId };
    setInvoices(prev => [invoiceWithJournalId, ...prev]);
    
    setIsDialogOpen(false);
    toast({
        title: "¡Factura Registrada!",
        description: `La factura ${newInvoiceData.uuid.substring(0,8)}... ha sido registrada y se ha creado la póliza ${newJournalEntry.number}.`
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Facturación (CFDI Emitidos)</CardTitle>
            <CardDescription>Administra las facturas emitidas a tus clientes.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Factura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Factura (CFDI)</DialogTitle>
                <DialogDescription>Sube el archivo XML para llenar los datos automáticamente.</DialogDescription>
              </DialogHeader>
              <AddInvoiceForm 
                clients={clients}
                onSave={handleSaveInvoice} 
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Folio Fiscal (UUID)</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estatus SAT</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Póliza</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{format(new Date(invoice.date), 'dd/MMM/yyyy', { locale: es })}</TableCell>
                <TableCell className="font-mono text-xs">{invoice.uuid}</TableCell>
                <TableCell>{clientMap.get(invoice.clientId) || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={invoice.satStatus === 'Cancelada' ? 'destructive' : 'default'} className={cn(invoice.satStatus === 'Vigente' && 'bg-green-600')}>
                    {invoice.satStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {invoice.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                </TableCell>
                <TableCell>
                  {invoice.journalEntryId ? (
                    <Button variant="link" asChild className="p-0 h-auto font-normal">
                      <Link to="/polizas">
                        <FileText className="mr-2 h-4 w-4"/>
                        {journalEntryMap.get(invoice.journalEntryId)}
                      </Link>
                    </Button>
                  ) : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Invoicing;
