
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { initialClients } from '@/data/clients';
import { journalEntries as initialJournalEntries } from '@/data/journalEntries';
import { Client } from '@/types/client';
import { JournalEntry } from '@/types/journal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar as CalendarIcon, FileDown, ArrowUp, ArrowDown, ChevronLeft, CircleAlert } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, subDays, compareAsc, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import NotFound from './NotFound';

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const calculateEntryAmount = (entry: JournalEntry) => {
  const total = entry.lines.reduce((sum, line) => sum + line.debit, 0);
  // Ingreso aumenta la deuda del cliente, Egreso la disminuye (es un pago)
  return entry.type === 'Ingreso' ? total : -total;
};

const ClientStatement = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { toast } = useToast();

  const client = useMemo(() => initialClients.find(c => c.id === clientId), [clientId]);
  const defaultDateRange: DateRange = { from: subDays(new Date(), 90), to: new Date() };
  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange);

  const statementData = useMemo(() => {
    if (!client) return { operations: [], openingBalance: 0, closingBalance: 0, isDelinquent: false };

    const clientEntries = initialJournalEntries
      .filter(entry => entry.clientId === client.id && (entry.type === 'Ingreso' || entry.type === 'Egreso'))
      .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)));

    const fromDate = dateRange?.from ? new Date(dateRange.from.setHours(0,0,0,0)) : new Date(0);

    const openingBalance = clientEntries
      .filter(entry => new Date(entry.date) < fromDate)
      .reduce((acc, entry) => acc + calculateEntryAmount(entry), 0);

    let runningBalance = openingBalance;

    const operations = clientEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        if (dateRange?.from && entryDate < dateRange.from) return false;
        if (dateRange?.to && entryDate > dateRange.to) return false;
        return true;
      })
      .map(entry => {
        const amount = calculateEntryAmount(entry);
        runningBalance += amount;
        return {
          ...entry,
          amount,
          runningBalance,
        };
      });
      
    const lastPayment = clientEntries.filter(e => e.type === 'Egreso').pop();
    const daysSinceLastPayment = lastPayment ? differenceInDays(new Date(), new Date(lastPayment.date)) : Infinity;
    const isDelinquent = (client.creditDays ?? 0) > 0 && daysSinceLastPayment > (client.creditDays ?? 0) && client.balance > 0;

    return { operations, openingBalance, closingBalance: runningBalance, isDelinquent };
  }, [client, dateRange]);

  const handleExportPDF = () => {
    if (!client) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Estado de Cuenta - ${client.name}`, 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`RFC: ${client.rfc}`, 14, 30);
    const dateRangeText = `Periodo: ${dateRange?.from ? format(dateRange.from, 'P', { locale: es }) : 'Inicio'} - ${dateRange?.to ? format(dateRange.to, 'P', { locale: es }) : 'Fin'}`;
    doc.text(dateRangeText, 14, 36);

    const tableData = statementData.operations.map(op => [
      format(new Date(op.date), 'dd/MM/yyyy'),
      op.number,
      op.concept,
      op.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
      op.runningBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
    ]);
    
    tableData.unshift(['Balance Inicial', '', '', '', statementData.openingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })]);

    doc.autoTable({
      startY: 45,
      head: [['Fecha', 'Póliza', 'Concepto', 'Monto', 'Saldo Acumulado']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] },
      foot: [['', '', '', 'Balance Final', statementData.closingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })]],
      footStyles: { fontStyle: 'bold' }
    });

    doc.save(`Estado_de_Cuenta_${client.rfc}.pdf`);
    toast({ title: "¡PDF Generado!", description: "El estado de cuenta se ha descargado." });
  };

  if (!client) {
    return <NotFound />;
  }

  const creditLimitExceeded = (client.creditLimit ?? 0) > 0 && client.balance > (client.creditLimit ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link to="/clientes"><ChevronLeft /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estado de Cuenta</h1>
          <p className="text-muted-foreground">Historial de operaciones para {client.name}</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Datos del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
          <div><span className="font-medium text-muted-foreground">RFC:</span> {client.rfc}</div>
          <div><span className="font-medium text-muted-foreground">Estatus:</span> <Badge variant={client.status === 'Activo' ? 'default' : 'destructive'}>{client.status}</Badge></div>
          <div><span className="font-medium text-muted-foreground">Saldo Actual:</span> <span className="font-mono">{client.balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
          <div><span className="font-medium text-muted-foreground">Límite de Crédito:</span> <span className="font-mono">{(client.creditLimit ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
          <div><span className="font-medium text-muted-foreground">Días de Crédito:</span> {client.creditDays ?? 0} días</div>
        </CardContent>
      </Card>

      {(creditLimitExceeded || statementData.isDelinquent) &&
        <Alert variant="destructive">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>¡Atención!</AlertTitle>
          <AlertDescription>
            {creditLimitExceeded && "El cliente ha sobrepasado su límite de crédito. "}
            {statementData.isDelinquent && "El cliente presenta morosidad."}
          </AlertDescription>
        </Alert>
      }

      <Card>
        <CardHeader>
          <CardTitle>Operaciones</CardTitle>
          <CardDescription>Movimientos registrados para el cliente.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date" variant={"outline"} className={cn("w-[300px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y", { locale: es })} - {format(dateRange.to, "LLL dd, y", { locale: es })}</>) : (format(dateRange.from, "LLL dd, y", { locale: es }))) : (<span>Elige un rango de fechas</span>)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={es} />
              </PopoverContent>
            </Popover>
            <div className="flex-grow"></div>
            <Button onClick={handleExportPDF} disabled={statementData.operations.length === 0}>
              <FileDown className="mr-2 h-4 w-4" /> Exportar a PDF
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Póliza</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Saldo Acumulado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow className="font-semibold bg-muted/50">
                    <TableCell colSpan={4}>Saldo Inicial al {dateRange?.from ? format(dateRange.from, 'P', { locale: es }) : 'inicio'}</TableCell>
                    <TableCell className="text-right">{statementData.openingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                </TableRow>
              {statementData.operations.length > 0 ? (
                statementData.operations.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell>{format(new Date(op.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{op.number}</TableCell>
                    <TableCell>{op.concept}</TableCell>
                    <TableCell className={cn("text-right font-mono flex justify-end items-center gap-1", op.amount > 0 ? "text-red-600" : "text-green-600")}>
                      {op.amount > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {Math.abs(op.amount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                    </TableCell>
                    <TableCell className="text-right font-mono">{op.runningBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">No se encontraron operaciones en el periodo seleccionado.</TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableCaption>
                Saldo Final al periodo: {statementData.closingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientStatement;
