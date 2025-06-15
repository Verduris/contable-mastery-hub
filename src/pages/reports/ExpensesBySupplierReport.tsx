
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, Legend } from "recharts";
import { DateRange } from 'react-day-picker';
import { format, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { initialClients } from '@/data/clients';
import { initialPayables } from '@/data/payables';
import { journalEntries } from '@/data/journalEntries';
import { JournalEntry, JournalEntryStatus } from '@/types/journal';

const journalStatusOptions: { value: JournalEntryStatus | 'todos'; label: string }[] = [
    { value: 'todos', label: 'Todos los estatus' },
    { value: 'Borrador', label: 'Borrador' },
    { value: 'Revisada', label: 'Revisada' },
    { value: 'Anulada', label: 'Anulada' },
];

const chartConfig = {
  totalPaid: {
    label: "Total Pagado",
    color: "hsl(var(--chart-1))",
  },
  outstandingBalance: {
    label: "Saldo Pendiente",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;


const ExpensesBySupplierReport = () => {
    const { toast } = useToast();
    const [date, setDate] = useState<DateRange | undefined>();
    const [selectedSupplier, setSelectedSupplier] = useState<string>('todos');
    const [selectedStatus, setSelectedStatus] = useState<JournalEntryStatus | 'todos'>('todos');

    const supplierMap = useMemo(() => new Map(initialClients.map(c => [c.id, c.name])), []);

    const filteredData = useMemo(() => {
        const fromDate = date?.from;
        const toDate = date?.to || (date?.from ? new Date(date.from.getTime() + 24 * 60 * 60 * 1000 -1) : undefined);

        const relevantSupplierIdsFromPayables = new Set(initialPayables.map(p => p.supplierId));
        const relevantSupplierIdsFromJournals = new Set(journalEntries.filter(j => j.type === 'Egreso' && j.clientId).map(j => j.clientId!));
        const allSupplierIds = new Set([...relevantSupplierIdsFromPayables, ...relevantSupplierIdsFromJournals]);

        const data = Array.from(allSupplierIds).map(supplierId => {
            const payables = initialPayables.filter(p => 
                p.supplierId === supplierId &&
                (!fromDate || !toDate || isWithinInterval(new Date(p.issueDate), { start: fromDate, end: toDate }))
            );
            
            const journals = journalEntries.filter(j => 
                j.clientId === supplierId && j.type === 'Egreso' &&
                (selectedStatus === 'todos' || j.status === selectedStatus) &&
                (!fromDate || !toDate || isWithinInterval(new Date(j.date), { start: fromDate, end: toDate }))
            );

            const totalPaid = payables.reduce((sum, p) => sum + p.paidAmount, 0);
            const outstandingBalance = payables.reduce((sum, p) => sum + p.outstandingBalance, 0);

            return {
                supplierId,
                supplierName: supplierMap.get(supplierId) || `Proveedor Desconocido (${supplierId})`,
                policyCount: journals.length,
                totalPaid,
                outstandingBalance,
            }
        });

        let result = data.filter(d => d.policyCount > 0 || d.totalPaid > 0 || d.outstandingBalance > 0);

        if (selectedSupplier !== 'todos') {
            result = result.filter(item => item.supplierId === selectedSupplier);
        }

        return result;

    }, [date, selectedSupplier, selectedStatus, supplierMap]);

    const handleDownload = () => {
        toast({
            title: "Función en desarrollo",
            description: "La exportación a Excel estará disponible pronto.",
        })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Reporte de Egresos por Proveedor</CardTitle>
                            <CardDescription>Analiza los egresos, pagos y saldos pendientes por proveedor.</CardDescription>
                        </div>
                        <Button onClick={handleDownload} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full md:w-[300px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                                                {format(date.to, "LLL dd, y", { locale: es })}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y", { locale: es })
                                        )
                                    ) : (
                                        <span>Selecciona un rango de fechas</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>

                        <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                            <SelectTrigger className="w-full md:w-[240px]">
                                <SelectValue placeholder="Filtrar por proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos los proveedores</SelectItem>
                                {initialClients.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Estatus de Póliza" />
                            </SelectTrigger>
                            <SelectContent>
                                {journalStatusOptions.map(opt => (
                                     <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Button onClick={() => { setDate(undefined); setSelectedSupplier('todos'); setSelectedStatus('todos'); }}>Limpiar Filtros</Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Gráfico de Egresos</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                                <BarChart accessibilityLayer data={filteredData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="supplierName"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => value.slice(0, 15) + (value.length > 15 ? '...' : '')}
                                    />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Bar dataKey="totalPaid" fill="var(--color-totalPaid)" name="Total Pagado" radius={4} stackId="a" />
                                    <Bar dataKey="outstandingBalance" fill="var(--color-outstandingBalance)" name="Saldo Pendiente" radius={4} stackId="a" />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                             <CardTitle>Datos Detallados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Proveedor</TableHead>
                                        <TableHead className="text-center">Nº de Pólizas</TableHead>
                                        <TableHead className="text-right">Total Pagado</TableHead>
                                        <TableHead className="text-right">Saldo Pendiente</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.length > 0 ? filteredData.map((item) => (
                                        <TableRow key={item.supplierId}>
                                            <TableCell className="font-medium">{item.supplierName}</TableCell>
                                            <TableCell className="text-center">{item.policyCount}</TableCell>
                                            <TableCell className="text-right">{item.totalPaid.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                                            <TableCell className="text-right">{item.outstandingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">No se encontraron datos con los filtros seleccionados.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </CardContent>
            </Card>
        </div>
    );
};

export default ExpensesBySupplierReport;
