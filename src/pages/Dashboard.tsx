
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users } from "lucide-react";
import { subMonths, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

import { useQuery } from '@tanstack/react-query';
import { fetchReceivables } from '@/queries/receivables';
import { fetchPayables } from '@/queries/payables';
import { initialClients } from '@/data/clients';
import { journalEntries } from '@/data/journalEntries';

import { FinancialMetricsCards } from '@/components/dashboard/FinancialMetricsCards';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { PieCharts } from '@/components/dashboard/PieCharts';
import { AlertsCard } from '@/components/dashboard/AlertsCard';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard Financiero</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/polizas">
              <PlusCircle className="mr-2 h-4 w-4"/>
              Nueva Póliza
            </Link>
          </Button>
          <Button asChild>
            <Link to="/clientes">
              <Users className="mr-2 h-4 w-4"/>
              Clientes
            </Link>
          </Button>
        </div>
      </div>
      
      <FinancialMetricsCards metrics={financialMetrics} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <IncomeExpenseChart data={incomeExpenseData} />
        <PieCharts 
          overdueReceivablesData={overdueReceivablesData} 
          payablesData={payablesData} 
        />
        <AlertsCard 
          receivables={initialReceivables}
          payables={initialPayables}
          clientMap={clientMap}
        />
      </div>
    </div>
  );
};

export default Dashboard;
