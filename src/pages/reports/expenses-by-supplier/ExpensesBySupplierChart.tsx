
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, Legend } from "recharts";

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

interface ExpenseData {
    supplierName: string;
    totalPaid: number;
    outstandingBalance: number;
}

interface ExpensesBySupplierChartProps {
    data: ExpenseData[];
}

export const ExpensesBySupplierChart = ({ data }: ExpensesBySupplierChartProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Gráfico de Egresos</CardTitle>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={data}>
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
    );
};
