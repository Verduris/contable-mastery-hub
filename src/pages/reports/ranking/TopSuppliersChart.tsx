
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { RankingData } from '@/hooks/reports/useRankingReport';

interface TopSuppliersChartProps {
  data: RankingData[];
}

const chartConfig = {
  total: {
    label: 'Egresos',
    color: 'hsl(var(--chart-2))',
  },
};

export const TopSuppliersChart = ({ data }: TopSuppliersChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Proveedores por Egresos</CardTitle>
        <CardDescription>
          Proveedores a los que se les ha pagado más en el periodo seleccionado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={120}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <XAxis dataKey="total" type="number" hide />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent
                formatter={(value) =>
                  new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  }).format(value as number)
                }
                nameKey="name"
              />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
