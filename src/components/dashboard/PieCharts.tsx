
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

const PIE_COLORS = ['#0ea5e9', '#f97316', '#10b981', '#f43f5e', '#8b5cf6'];

interface PieData {
  name: string;
  value: number;
}

interface PieChartsProps {
  overdueReceivablesData: PieData[];
  payablesData: PieData[];
}

export const PieCharts = ({ overdueReceivablesData, payablesData }: PieChartsProps) => {
  return (
    <>
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Cartera Vencida por Cliente (Top 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={overdueReceivablesData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100} 
                labelLine={false} 
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {overdueReceivablesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Cuentas por Pagar por Proveedor (Top 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={payablesData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100} 
                labelLine={false} 
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {payablesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};
