
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchReceivables } from '@/queries/receivables';
import { fetchPayables } from '@/queries/payables';
import { fetchClients } from '@/queries/clients';
import { fetchJournalEntries } from '@/queries/journalEntries';
import { subMonths, eachMonthOfInterval, format, isWithinInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export const useDashboard = () => {
  const { data: receivables = [] } = useQuery({ queryKey: ['receivables'], queryFn: fetchReceivables });
  const { data: payables = [] } = useQuery({ queryKey: ['payables'], queryFn: fetchPayables });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
  const { data: journalEntries = [] } = useQuery({ queryKey: ['journalEntries'], queryFn: () => fetchJournalEntries() });

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients]);

  const metrics = useMemo(() => {
    const totalReceivable = receivables
      .filter(r => r.status !== 'Cancelada' && r.status !== 'Pagada')
      .reduce((sum, r) => sum + r.outstandingBalance, 0);

    const totalPayable = payables
      .filter(p => p.status !== 'Cancelada' && p.status !== 'Pagada')
      .reduce((sum, p) => sum + p.outstandingBalance, 0);

    const netBalance = totalReceivable - totalPayable;

    // Calcular ingresos y egresos del mes actual
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const monthlyIncomeEntries = journalEntries.filter(entry => {
      return entry.type === 'Ingreso' && 
             entry.status === 'Revisada' &&
             isWithinInterval(parseISO(entry.date), { start: monthStart, end: monthEnd });
    });

    const monthlyExpenseEntries = journalEntries.filter(entry => {
      return entry.type === 'Egreso' && 
             entry.status === 'Revisada' &&
             isWithinInterval(parseISO(entry.date), { start: monthStart, end: monthEnd });
    });

    const monthlyIncome = monthlyIncomeEntries.reduce((sum, entry) => {
      return sum + entry.lines.reduce((lineSum, line) => lineSum + line.credit, 0);
    }, 0);

    const monthlyExpense = monthlyExpenseEntries.reduce((sum, entry) => {
      return sum + entry.lines.reduce((lineSum, line) => lineSum + line.debit, 0);
    }, 0);

    return {
      totalReceivable,
      totalPayable,
      netBalance,
      monthlyIncome,
      monthlyExpense,
    };
  }, [receivables, payables, journalEntries]);

  const incomeExpenseData = useMemo(() => {
    const sixMonthsAgo = subMonths(new Date(), 5);
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: new Date() });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthName = format(month, 'MMM', { locale: es });

      const monthlyIncomeEntries = journalEntries.filter(entry => {
        return entry.type === 'Ingreso' && 
               entry.status === 'Revisada' &&
               isWithinInterval(parseISO(entry.date), { start: monthStart, end: monthEnd });
      });

      const monthlyExpenseEntries = journalEntries.filter(entry => {
        return entry.type === 'Egreso' && 
               entry.status === 'Revisada' &&
               isWithinInterval(parseISO(entry.date), { start: monthStart, end: monthEnd });
      });

      const ingresos = monthlyIncomeEntries.reduce((sum, entry) => {
        return sum + entry.lines.reduce((lineSum, line) => lineSum + line.credit, 0);
      }, 0);

      const egresos = monthlyExpenseEntries.reduce((sum, entry) => {
        return sum + entry.lines.reduce((lineSum, line) => lineSum + line.debit, 0);
      }, 0);

      return {
        name: monthName,
        ingresos,
        egresos,
      };
    });
  }, [journalEntries]);

  const overdueReceivablesData = useMemo(() => {
    const overdueReceivables = receivables.filter(r => r.status === 'Vencida');
    const clientTotals = overdueReceivables.reduce((acc, r) => {
      const clientName = clientMap.get(r.clientId) || 'Cliente Desconocido';
      acc[clientName] = (acc[clientName] || 0) + r.outstandingBalance;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(clientTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [receivables, clientMap]);

  const payablesData = useMemo(() => {
    const activePayables = payables.filter(p => p.status !== 'Cancelada' && p.status !== 'Pagada');
    const supplierTotals = activePayables.reduce((acc, p) => {
      const supplierName = clientMap.get(p.supplierId) || 'Proveedor Desconocido';
      acc[supplierName] = (acc[supplierName] || 0) + p.outstandingBalance;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(supplierTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [payables, clientMap]);

  return {
    metrics,
    incomeExpenseData,
    overdueReceivablesData,
    payablesData,
    receivables,
    payables,
    clientMap,
  };
};
