import { useState, useMemo } from 'react';
import { Client } from '@/types/client';
import { JournalEntry, JournalEntryStatus } from '@/types/journal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, FileDown, RotateCcw } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { fetchClients } from '@/queries/invoices';
import { fetchJournalEntries } from '@/queries/journalEntries';
import { Skeleton } from '@/components/ui/skeleton';

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const IncomeByClientReport = () => {
  const { toast } = useToast();
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
  const { data: journalEntries = [], isLoading: isLoadingJournalEntries } = useQuery({ queryKey: ['journalEntries'], queryFn: () => fetchJournalEntries() });

  const defaultDateRange: DateRange = { from: subDays(new Date(), 30), to: new Date() };
  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange);
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<JournalEntryStatus | 'all'>('Revisada');

  const calculateEntryTotal = (lines: JournalEntry['lines']) => {
    return lines.reduce((sum, line) => sum + line.debit, 0);
  };
  
  const reportData = useMemo(() => {
    if (isLoadingClients || isLoadingJournalEntries) return [];
    
    const clientMap = new Map(clients.map(c => [c.id, c]));

    const filteredEntries = journalEntries.filter(entry => {
      if (entry.type !== 'Ingreso') return false;
      if (selectedStatus !== 'all' && entry.status !== selectedStatus) return false;
      if (selectedClientId !== 'all' && entry.clientId !== selectedClientId) return false;
      const entryDate = new Date(entry.date);
      if (dateRange?.from && entryDate < dateRange.from) return false;
      if (dateRange?.to && entryDate > dateRange.to) return false;
      return true;
    });

    const incomeByClient = filteredEntries.reduce((acc, entry) => {
      if (!entry.clientId) return acc;
      if (!acc[entry.clientId]) {
        acc[entry.clientId] = { totalAmount: 0, count: 0 };
      }
      acc[entry.clientId].totalAmount += calculateEntryTotal(entry.lines);
      acc[entry.clientId].count++;
      return acc;
    }, {} as Record<string, { totalAmount: number; count: number }>);
    
    return Object.entries(incomeByClient).map(([clientId, data]) => {
      const client = clientMap.get(clientId);
      return {
        clientId,
        clientName: client?.name || 'Cliente Desconocido',
        totalIncomeEntries: data.count,
        totalAmountReceived: data.totalAmount,
        currentBalance: client?.balance || 0,
      };
    }).sort((a, b) => b.totalAmountReceived - a.totalAmountReceived);
  }, [journalEntries, clients, dateRange, selectedClientId, selectedStatus, isLoadingClients, isLoadingJournalEntries]);
  
  const isLoading = isLoadingClients || isLoadingJournalEntries;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Reporte de Ingresos por Cliente', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    const filtersText = `Filtros: Estatus(${selectedStatus}), Cliente(${selectedClientId === 'all' ? 'Todos' : clients.find(c => c.id === selectedClientId)?.name}), Fecha(${dateRange?.from ? format(dateRange.from, 'P') : 'N/A'} - ${dateRange?.to ? format(dateRange.to, 'P') : 'N/A'})`;
    doc.text(filtersText, 14, 32);

    const tableData = reportData.map(item => [
      item.clientName,
      item.totalIncomeEntries.toString(),
      item.totalAmountReceived.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
      item.currentBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Cliente', 'Nº Pólizas', 'Total Recibido', 'Saldo Actual']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] },
    });

    doc.save('Reporte_Ingresos_por_Cliente.pdf');
    toast({
      title: "¡PDF Generado!",
      description: "El reporte se ha descargado correctamente."
    });
  };

  const resetFilters = () => {
    setDateRange(defaultDateRange);
    setSelectedClientId('all');
    setSelectedStatus('Revisada');
    toast({ title: "Filtros reiniciados" });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporte de Ingresos por Cliente</CardTitle>
        <CardDescription>Analiza los ingresos totales de tus clientes en un periodo determinado.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
           <Popover>
            <PopoverTrigger asChild>
              <Button id="date" variant={"outline"} className={cn("w-[300px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")} disabled={isLoading}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                      {format(dateRange.to, "LLL dd, y", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y", { locale: es })
                  )
                ) : (
                  <span>Elige un rango de fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={es} />
            </PopoverContent>
          </Popover>
          <Select value={selectedClientId} onValueChange={setSelectedClientId} disabled={isLoading}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)} disabled={isLoading}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Estatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estatus</SelectItem>
              <SelectItem value="Borrador">Borrador</SelectItem>
              <SelectItem value="Revisada">Revisada</SelectItem>
              <SelectItem value="Anulada">Anulada</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={resetFilters} variant="ghost" disabled={isLoading}>
            <RotateCcw className="mr-2 h-4 w-4"/>
            Limpiar
          </Button>
          <div className="flex-grow"></div>
          <Button onClick={handleExportPDF} disabled={reportData.length === 0 || isLoading}>
            <FileDown className="mr-2 h-4 w-4"/>
            Exportar a PDF
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-center">Nº Pólizas de Ingreso</TableHead>
              <TableHead className="text-right">Total Recibido</TableHead>
              <TableHead className="text-right">Saldo Actual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-1/2 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-1/2 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-1/2 ml-auto" /></TableCell>
                    </TableRow>
                ))
            ) : reportData.length > 0 ? (
              reportData.map((item) => (
                <TableRow key={item.clientId}>
                  <TableCell className="font-medium">{item.clientName}</TableCell>
                  <TableCell className="text-center">{item.totalIncomeEntries}</TableCell>
                  <TableCell className="text-right">{item.totalAmountReceived.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                  <TableCell className={cn("text-right", item.currentBalance < 0 ? "text-red-600" : "text-green-600")}>{item.currentBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No se encontraron resultados con los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
           <TableCaption>
             {reportData.length > 0 ? `Un total de ${reportData.length} clientes con ingresos en el periodo.` : 'Ajusta los filtros para ver resultados.'}
           </TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
};

export default IncomeByClientReport;
