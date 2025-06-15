
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

interface CashFlowChartProps {
    data: {
        date: string;
        income: number;
        expenses: number;
        accumulated: number;
    }[];
}

const chartConfig = {
    income: {
      label: 'Ingresos',
      color: 'hsl(var(--chart-2))',
    },
    expenses: {
      label: 'Egresos',
      color: 'hsl(var(--chart-1))',
    },
    accumulated: {
        label: 'Saldo Acumulado',
        color: 'hsl(var(--chart-3))',
    }
};

export const CashFlowChart = ({ data }: CashFlowChartProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tendencia del Flujo de Caja</CardTitle>
                <CardDescription>Ingresos vs. Egresos y Saldo Acumulado en el tiempo.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend content={<ChartLegendContent />} />
                        <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="accumulated" stroke="var(--color-accumulated)" strokeWidth={2} dot={false} name="Saldo Acumulado" />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
