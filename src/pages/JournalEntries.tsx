
import { useState } from "react";
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
import { JournalEntry, JournalEntryFormData } from "@/types/journal";
import { useToast } from "@/hooks/use-toast";
import { accounts as initialAccounts } from "@/data/accounts";
import { journalEntries as initialJournalEntries } from "@/data/journalEntries"; // Using mock data for now
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Extender la interfaz de jsPDF para incluir autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const JournalEntries = () => {
  const [accounts] = useState<Account[]>(initialAccounts);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialJournalEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSaveEntry = (data: JournalEntryFormData) => {
    const newEntry: JournalEntry = {
      id: (journalEntries.length + 1).toString(),
      number: data.number,
      date: data.date.toISOString(),
      concept: data.concept,
      type: data.type,
      status: data.status,
      reference: data.reference,
      lines: data.lines.map((line, index) => ({
          ...line,
          id: `${journalEntries.length + 1}-${index}`
      }))
    };
    setJournalEntries([...journalEntries, newEntry]);
    setIsDialogOpen(false);
    toast({
        title: "¡Póliza guardada!",
        description: `La póliza "${newEntry.number}: ${newEntry.concept}" ha sido creada.`,
    })
  };

  const handleVoidEntry = (entryId: string) => {
    setJournalEntries(currentEntries =>
      currentEntries.map(entry =>
        entry.id === entryId
          ? { ...entry, status: 'Anulada' }
          : entry
      )
    );
    const voidedEntry = journalEntries.find(entry => entry.id === entryId);
    if (voidedEntry) {
      toast({
        title: "¡Póliza Anulada!",
        description: `La póliza "${voidedEntry.number}" ha sido marcada como anulada.`,
      })
    }
  };

  const getNextEntryNumber = () => {
    const lastEntry = journalEntries.at(-1);
    if (!lastEntry) return "P-001";
    const lastNum = parseInt(lastEntry.number.split('-')[1]);
    return `P-${(lastNum + 1).toString().padStart(3, '0')}`;
  }

  const calculateTotal = (lines: JournalEntry['lines']) => {
    return lines.reduce((sum, line) => sum + line.debit, 0);
  }

  const accountMap = new Map(accounts.map(acc => [acc.id, `${acc.code} - ${acc.name}`]));

  const handleExportPDF = (entry: JournalEntry) => {
    const doc = new jsPDF();
    const total = calculateTotal(entry.lines);

    doc.setFontSize(18);
    doc.text(`Póliza Contable: ${entry.number}`, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    
    doc.text(`Fecha: ${format(new Date(entry.date), 'PPP', { locale: es })}`, 14, 32);
    doc.text(`Tipo: ${entry.type}`, 14, 38);
    doc.text(`Concepto: ${entry.concept}`, 14, 44);
    if(entry.reference) {
        doc.text(`Referencia: ${entry.reference}`, 14, 50);
    }

    const tableData = entry.lines.map(line => [
        accountMap.get(line.accountId) || 'N/A',
        line.description,
        line.debit > 0 ? line.debit.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : '',
        line.credit > 0 ? line.credit.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : '',
    ]);

    doc.autoTable({
        startY: entry.reference ? 56 : 50,
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pólizas Contables</CardTitle>
            <CardDescription>Registra y administra las operaciones de tu negocio.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Póliza
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Póliza Contable</DialogTitle>
              </DialogHeader>
              <JournalEntryForm 
                accounts={accounts}
                onSave={handleSaveEntry} 
                onCancel={() => setIsDialogOpen(false)}
                nextEntryNumber={getNextEntryNumber()}
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
              <TableHead>Estatus</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {journalEntries.map((entry) => (
              <TableRow key={entry.id} className={cn(entry.status === 'Anulada' && 'text-muted-foreground')}>
                <TableCell>{format(new Date(entry.date), 'dd/MMM/yyyy', { locale: es })}</TableCell>
                <TableCell>{entry.type}</TableCell>
                <TableCell className="font-medium">{entry.number}</TableCell>
                <TableCell>{entry.concept}</TableCell>
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
                       <DropdownMenuItem disabled>
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default JournalEntries;
