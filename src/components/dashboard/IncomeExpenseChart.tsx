
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

interface IncomeExpenseData {
  name: string;
  ingresos: number;
  egresos: number;
}

interface IncomeExpenseChartProps {
  data: IncomeExpenseData[];
}

export const IncomeExpenseChart = ({ data }: IncomeExpenseChartProps) => {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Ingresos vs. Egresos (Últimos 6 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
            <Bar dataKey="egresos" fill="#f43f5e" name="Egresos" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
