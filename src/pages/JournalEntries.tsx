
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
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { JournalEntryForm } from "@/components/JournalEntryForm";
import { Account } from "@/types/account";
import { JournalEntry, JournalEntryFormData } from "@/types/journal";
import { useToast } from "@/components/ui/use-toast";
import { accounts as initialAccounts } from "@/data/accounts";
import { journalEntries as initialJournalEntries } from "@/data/journalEntries"; // Using mock data for now
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
      status: 'Guardada',
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

  const getNextEntryNumber = () => {
    const lastEntry = journalEntries.at(-1);
    if (!lastEntry) return "P-001";
    const lastNum = parseInt(lastEntry.number.split('-')[1]);
    return `P-${(lastNum + 1).toString().padStart(3, '0')}`;
  }

  const calculateTotal = (lines: JournalEntry['lines']) => {
    return lines.reduce((sum, line) => sum + line.debit, 0);
  }

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {journalEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{format(new Date(entry.date), 'dd/MMM/yyyy', { locale: es })}</TableCell>
                <TableCell>{entry.type}</TableCell>
                <TableCell className="font-medium">{entry.number}</TableCell>
                <TableCell>{entry.concept}</TableCell>
                <TableCell>
                  <Badge>{entry.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {calculateTotal(entry.lines).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
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
