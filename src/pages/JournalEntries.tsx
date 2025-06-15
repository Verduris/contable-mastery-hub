import { useState, useEffect } from "react";
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
import { MoreHorizontal, Edit, Copy, XCircle, PlusCircle, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JournalEntryForm } from "@/components/JournalEntryForm";
import { Account } from "@/types/account";
import { Client } from "@/types/client";
import { JournalEntry, JournalEntryFormData } from "@/types/journal";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAccounts } from "@/queries/accounts";
import { 
  fetchJournalEntries,
  upsertJournalEntry,
  updateJournalEntryStatus,
  fetchNextEntryNumber,
} from "@/queries/journalEntries";
import { initialClients } from "@/data/clients";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { initialInvoices } from "@/data/invoices";
import { Invoice } from "@/types/invoice";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Extender la interfaz de jsPDF para incluir autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const JournalEntries = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  const { data: journalEntries = [], isLoading: isLoadingEntries, isError, error } = useQuery({
    queryKey: ["journalEntries"],
    queryFn: fetchJournalEntries,
  });

  const [clients] = useState<Client[]>(initialClients);
  const [invoices] = useState<Invoice[]>(initialInvoices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [nextEntryNumber, setNextEntryNumber] = useState("");

  useEffect(() => {
    if (isDialogOpen && !editingEntry) {
        fetchNextEntryNumber().then(setNextEntryNumber);
    }
  }, [isDialogOpen, editingEntry]);

  const upsertMutation = useMutation({
    mutationFn: ({ data, id }: { data: JournalEntryFormData, id: string | null }) => upsertJournalEntry(data, id),
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      setIsDialogOpen(false);
      setEditingEntry(null);
      toast({
        title: `¡Póliza ${editingEntry ? 'actualizada' : 'guardada'}!`,
        description: `La póliza "${data.number}" ha sido guardada exitosamente.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al guardar la póliza",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
        setEditingEntry(null);
    }
  });

  const voidMutation = useMutation({
    mutationFn: (entryId: string) => updateJournalEntryStatus(entryId, 'Anulada'),
    onSuccess: (_, entryId) => {
        queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
        const voidedEntry = journalEntries.find(entry => entry.id === entryId);
        toast({
            title: "¡Póliza Anulada!",
            description: `La póliza "${voidedEntry?.number}" ha sido marcada como anulada.`,
        });
    },
    onError: (error: Error) => {
        toast({
            title: "Error al anular la póliza",
            description: error.message,
            variant: "destructive",
        });
    }
  });

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const handleSaveEntry = (data: JournalEntryFormData) => {
    upsertMutation.mutate({ data, id: editingEntry ? editingEntry.id : null });
  };

  const handleVoidEntry = (entryId: string) => {
    voidMutation.mutate(entryId);
  };

  const calculateTotal = (lines: JournalEntry['lines']) => {
    return lines.reduce((sum, line) => sum + line.debit, 0);
  };

  const accountMap = new Map(accounts.map(acc => [acc.id, `${acc.code} - ${acc.name}`]));
  const clientMap = new Map(clients.map(client => [client.id, client.name]));

  const handleExportPDF = (entry: JournalEntry) => {
    const doc = new jsPDF();
    const total = calculateTotal(entry.lines);
    const clientName = entry.clientId ? clientMap.get(entry.clientId) : null;

    doc.setFontSize(18);
    doc.text(`Póliza Contable: ${entry.number}`, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    
    let yPos = 32;
    doc.text(`Fecha: ${format(new Date(entry.date), 'PPP', { locale: es })}`, 14, yPos); yPos += 6;
    doc.text(`Tipo: ${entry.type}`, 14, yPos); yPos += 6;
    if (clientName) {
        doc.text(`Cliente: ${clientName}`, 14, yPos); yPos += 6;
    }
    doc.text(`Concepto: ${entry.concept}`, 14, yPos); yPos += 6;
    if(entry.reference) {
        doc.text(`Referencia: ${entry.reference}`, 14, yPos); yPos += 6;
    }

    const tableData = entry.lines.map(line => [
        accountMap.get(line.accountId) || 'N/A',
        line.description,
        line.debit > 0 ? line.debit.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : '',
        line.credit > 0 ? line.credit.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : '',
    ]);

    doc.autoTable({
        startY: yPos,
        head: [['Cuenta', 'Descripción', 'Debe', 'Haber']],
        body: tableData,
        foot: [[
            { content: 'Totales', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }), styles: { halign: 'right', fontStyle: 'bold' } },
            { content: total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }), styles: { halign: 'right', fontStyle: 'bold' } }
        ]],
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74], textColor: 255 },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 'auto' },
            2: { halign: 'right', cellWidth: 30 },
            3: { halign: 'right', cellWidth: 30 },
        },
        didDrawPage: (data) => {
            const signatureY = data.cursor.y + 30;
            if (signatureY > doc.internal.pageSize.height - 30) {
                doc.addPage();
            }
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.text('____________________', 20, signatureY);
            doc.text('Elaboró', 35, signatureY + 5);
            doc.text('____________________', 80, signatureY);
            doc.text('Revisó', 98, signatureY + 5);
            doc.text('____________________', 140, signatureY);
            doc.text('Autorizó', 155, signatureY + 5);
        },
    });

    doc.save(`Poliza-${entry.number}.pdf`);
    toast({
        title: "¡PDF Generado!",
        description: `Se ha descargado la póliza ${entry.number}.`
    });
  };

  const renderTableBody = () => {
    if (isLoadingAccounts || isLoadingEntries) {
      return (
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-48" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }

    if (isError) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={8} className="py-10 text-center">
               <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error al Cargar Pólizas</AlertTitle>
                <AlertDescription>
                  {error instanceof Error ? error.message : "Ocurrió un error inesperado."}
                </AlertDescription>
              </Alert>
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }
    
    if (journalEntries.length === 0) {
        return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                        No hay pólizas registradas todavía. ¡Crea la primera!
                    </TableCell>
                </TableRow>
            </TableBody>
        );
    }

    return (
      <TableBody>
        {journalEntries.map((entry) => {
          const linkedInvoice = entry.invoiceId ? invoices.find(inv => inv.id === entry.invoiceId) : null;
          return (
          <TableRow key={entry.id} className={cn(entry.status === 'Anulada' && 'text-muted-foreground')}>
            <TableCell>{format(new Date(entry.date), 'dd/MMM/yyyy', { locale: es })}</TableCell>
            <TableCell>{entry.type}</TableCell>
            <TableCell className="font-medium">{entry.number}</TableCell>
            <TableCell>
              {entry.concept}
              {linkedInvoice && (
                <Button variant="link" size="sm" className="p-0 h-auto ml-2 font-normal text-xs" asChild>
                    <Link to="/facturacion">(Factura: {linkedInvoice.uuid.substring(0,8)}...)</Link>
                </Button>
              )}
            </TableCell>
            <TableCell>{entry.clientId ? clientMap.get(entry.clientId) : 'N/A'}</TableCell>
            <TableCell>
              <Badge variant={entry.status === 'Anulada' ? 'destructive' : 'default'} className={cn(
                entry.status === 'Revisada' && 'bg-green-600 hover:bg-green-700 text-white border-transparent',
                entry.status === 'Borrador' && 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent'
              )}>
                {entry.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {calculateTotal(entry.lines).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
            </TableCell>
            <TableCell className="text-right">
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0" disabled={entry.status === 'Anulada'}>
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                   <DropdownMenuItem onClick={() => handleEdit(entry)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Ver/Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Duplicar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportPDF(entry)} disabled={entry.status !== 'Revisada'}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Exportar PDF</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleVoidEntry(entry.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    <span>Anular</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        )})}
      </TableBody>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pólizas Contables</CardTitle>
            <CardDescription>Registra y administra las operaciones de tu negocio.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingEntry(null); }}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Póliza
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{editingEntry ? 'Editar' : 'Crear Nueva'} Póliza Contable</DialogTitle>
              </DialogHeader>
              <JournalEntryForm 
                accounts={accounts}
                clients={clients}
                onSave={handleSaveEntry} 
                onCancel={() => { setIsDialogOpen(false); setEditingEntry(null); }}
                initialData={editingEntry}
                nextEntryNumber={nextEntryNumber}
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
              <TableHead>Tipo</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          {renderTableBody()}
        </Table>
      </CardContent>
    </Card>
  );
};

export default JournalEntries;
