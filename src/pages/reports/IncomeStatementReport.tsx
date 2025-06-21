
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { LineChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip, Line } from "recharts";
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useIncomeStatement } from '@/hooks/reports/useIncomeStatement';

const chartConfig = {
  income: {
    label: "Ingresos",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Egresos",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const IncomeStatementReport = () => {
    const { toast } = useToast();
    const [date, setDate] = useState<DateRange | undefined>();
    
    const { processedData, isLoading } = useIncomeStatement({ dateRange: date });

    const formatCurrency = (value: number) => {
        return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    }

    const handleDownload = () => {
        toast({
            title: "Función en desarrollo",
            description: "La exportación a PDF estará disponible pronto.",
        })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Estado de Resultados Simplificado</CardTitle>
                            <CardDescription>Analiza tus ingresos, egresos y la utilidad neta en un periodo determinado.</CardDescription>
                        </div>
                        <Button onClick={handleDownload} variant="outline" disabled={isLoading}>
                            <Download className="mr-2 h-4 w-4" />
                            Exportar a PDF
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
                                    disabled={isLoading}
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
                        <Button onClick={() => { setDate(undefined); }} disabled={isLoading}>Limpiar Filtros</Button>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold text-green-600">{formatCurrency(processedData.totalIncome)}</div>}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold text-red-600">{formatCurrency(processedData.totalExpenses)}</div>}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className={`text-2xl font-bold ${processedData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(processedData.netProfit)}</div>}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Análisis Mensual</CardTitle>
                             <CardDescription>
                                {date?.from && date.to ? `Mostrando datos para el periodo seleccionado.` : 'Selecciona un rango de fechas para ver el gráfico.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             {isLoading ? (
                                <div className="flex justify-center items-center min-h-[300px]">
                                    <Skeleton className="h-[300px] w-full" />
                                </div>
                             ) : (
                                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                                    <LineChart accessibilityLayer data={processedData.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tickFormatter={(value) => `$${(value as number / 1000)}k`}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<ChartTooltipContent />} />
                                        <Legend />
                                        <Line type="monotone" dataKey="income" name="Ingresos" stroke="var(--color-income)" strokeWidth={2} dot={true} />
                                        <Line type="monotone" dataKey="expenses" name="Egresos" stroke="var(--color-expenses)" strokeWidth={2} dot={true} />
                                    </LineChart>
                                </ChartContainer>
                             )}
                        </CardContent>
                    </Card>

                </CardContent>
            </Card>
        </div>
    );
};

export default IncomeStatementReport;
