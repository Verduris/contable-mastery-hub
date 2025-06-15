
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowDown, ArrowUp, CircleDollarSign, FileMinus, FilePlus, AlertCircle, PlusCircle, Users, FileText } from "lucide-react";
import { subMonths, format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

import { useQuery } from '@tanstack/react-query';
import { fetchReceivables } from '@/queries/receivables';
import { fetchPayables } from '@/queries/payables';
import { initialClients } from '@/data/clients';
import { journalEntries } from '@/data/journalEntries';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

const StatCard = ({ title, value, icon: Icon, linkTo, colorClass }: { title: string, value: string, icon: React.ElementType, linkTo?: string, colorClass?: string }) => {
  const content = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", colorClass)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
};


const Dashboard = () => {
  const { data: initialReceivables = [] } = useQuery({ queryKey: ['receivables'], queryFn: fetchReceivables });
  const { data: initialPayables = [] } = useQuery({ queryKey: ['payables'], queryFn: fetchPayables });
  const clientMap = useMemo(() => new Map(initialClients.map(c => [c.id, c.name])), []);

  const financialMetrics = useMemo(() => {
    const totalReceivable = initialReceivables
      .filter(r => r.status !== 'Pagada')
      .reduce((acc, r) => acc + r.outstandingBalance, 0);

    const totalPayable = initialPayables
      .filter(p => p.status !== 'Pagada')
      .reduce((acc, p) => acc + p.outstandingBalance, 0);

    const netBalance = totalReceivable - totalPayable;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const currentMonthEntries = journalEntries.filter(j => {
      const entryDate = parseISO(j.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    const monthlyIncome = currentMonthEntries
      .filter(j => j.type === 'Ingreso')
      .reduce((acc, j) => acc + j.lines.reduce((lineAcc, line) => lineAcc + line.credit, 0), 0);

    const monthlyExpense = currentMonthEntries
      .filter(j => j.type === 'Egreso')
      .reduce((acc, j) => acc + j.lines.reduce((lineAcc, line) => lineAcc + line.debit, 0), 0);

    return { totalReceivable, totalPayable, netBalance, monthlyIncome, monthlyExpense };
  }, [initialReceivables, initialPayables]);

  const incomeExpenseData = useMemo(() => {
    const data: { [key: string]: { name: string; ingresos: number; egresos: number } } = {};
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = subMonths(today, i);
        const monthKey = format(date, 'MMM yy', { locale: es });
        data[monthKey] = { name: monthKey, ingresos: 0, egresos: 0 };
    }

    journalEntries.forEach(entry => {
        const entryDate = parseISO(entry.date);
        const firstDayOfPeriod = subMonths(today, 5);
        firstDayOfPeriod.setDate(1);
        
        if (entryDate >= firstDayOfPeriod) {
            const monthKey = format(entryDate, 'MMM yy', { locale: es });
            if (data[monthKey]) {
                if (entry.type === 'Ingreso') {
                    data[monthKey].ingresos += entry.lines.reduce((sum, line) => sum + line.credit, 0);
                } else if (entry.type === 'Egreso') {
                    data[monthKey].egresos += entry.lines.reduce((sum, line) => sum + line.debit, 0);
                }
            }
        }
    });

    return Object.values(data);
  }, []);

  const overdueReceivablesData = useMemo(() => {
    const byClient = initialReceivables
      .filter(r => r.status === 'Vencida')
      .reduce((acc, r) => {
        const clientName = clientMap.get(r.clientId) || 'Desconocido';
        acc[clientName] = (acc[clientName] || 0) + r.outstandingBalance;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(byClient)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [clientMap, initialReceivables]);

  const payablesData = useMemo(() => {
    const bySupplier = initialPayables
      .filter(p => p.status !== 'Pagada')
      .reduce((acc, p) => {
        const supplierName = clientMap.get(p.supplierId) || 'Desconocido';
        acc[supplierName] = (acc[supplierName] || 0) + p.outstandingBalance;
        return acc;
      }, {} as Record<string, number>);
      
    return Object.entries(bySupplier)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [clientMap, initialPayables]);
  
  const alerts = useMemo(() => {
    const topOverdueReceivables = initialReceivables
      .filter(r => r.status === 'Vencida')
      .sort((a, b) => differenceInDays(new Date(), parseISO(b.dueDate)) - differenceInDays(new Date(), parseISO(a.dueDate)))
      .slice(0, 3);
      
    const topOverduePayables = initialPayables
      .filter(p => p.status === 'Vencida')
      .sort((a, b) => b.outstandingBalance - a.outstandingBalance)
      .slice(0, 3);

    return { topOverdueReceivables, topOverduePayables };
  }, [clientMap, initialReceivables, initialPayables]);

  const PIE_COLORS = ['#0ea5e9', '#f97316', '#10b981', '#f43f5e', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard Financiero</h1>
        <div className="flex items-center gap-2">
            <Button asChild variant="outline"><Link to="/polizas"><PlusCircle className="mr-2 h-4 w-4"/>Nueva Póliza</Link></Button>
            <Button asChild><Link to="/clientes"><Users className="mr-2 h-4 w-4"/>Clientes</Link></Button>
        </div>
      </div>
      
      {/* Key Financial Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total por Cobrar" value={formatCurrency(financialMetrics.totalReceivable)} icon={FilePlus} linkTo="/cuentas-por-cobrar" colorClass="text-sky-500" />
        <StatCard title="Total por Pagar" value={formatCurrency(financialMetrics.totalPayable)} icon={FileMinus} linkTo="/cuentas-por-pagar" colorClass="text-orange-500" />
        <StatCard title="Saldo Neto" value={formatCurrency(financialMetrics.netBalance)} icon={CircleDollarSign} colorClass={financialMetrics.netBalance >= 0 ? 'text-green-500' : 'text-red-500'}/>
        <StatCard title="Ingresos del Mes" value={formatCurrency(financialMetrics.monthlyIncome)} icon={ArrowUp} linkTo="/polizas" colorClass="text-emerald-500" />
        <StatCard title="Egresos del Mes" value={formatCurrency(financialMetrics.monthlyExpense)} icon={ArrowDown} linkTo="/polizas" colorClass="text-rose-500" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Ingresos vs. Egresos (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeExpenseData}>
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
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cartera Vencida por Cliente (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={overdueReceivablesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
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
                <Pie data={payablesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
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
        
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center"><AlertCircle className="mr-2 h-5 w-5 text-destructive" />Alertas Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div>
                    <h4 className="font-semibold text-destructive">CXC Vencidas (Top 3)</h4>
                    {alerts.topOverdueReceivables.length > 0 ? (
                        <ul className="list-disc pl-5 text-muted-foreground">
                            {alerts.topOverdueReceivables.map(r => (
                                <li key={r.id}>{clientMap.get(r.clientId)} - {formatCurrency(r.outstandingBalance)}</li>
                            ))}
                        </ul>
                    ) : <p className="text-muted-foreground">No hay cuentas por cobrar vencidas.</p>}
                </div>
                 <div>
                    <h4 className="font-semibold text-destructive">CXP Vencidas (Top 3)</h4>
                    {alerts.topOverduePayables.length > 0 ? (
                        <ul className="list-disc pl-5 text-muted-foreground">
                            {alerts.topOverduePayables.map(p => (
                                <li key={p.id}>{clientMap.get(p.supplierId)} - {formatCurrency(p.outstandingBalance)}</li>
                            ))}
                        </ul>
                    ) : <p className="text-muted-foreground">No hay cuentas por pagar vencidas.</p>}
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
