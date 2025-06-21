
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchJournalEntries } from '@/queries/journalEntries';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO, eachMonthOfInterval, startOfMonth, endOfMonth, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UseIncomeStatementParams {
    dateRange: DateRange | undefined;
}

export const useIncomeStatement = ({ dateRange }: UseIncomeStatementParams) => {
    const { data: journalEntries = [], isLoading } = useQuery({
        queryKey: ['journalEntries'],
        queryFn: () => fetchJournalEntries()
    });

    const processedData = useMemo(() => {
        const fromDate = dateRange?.from;
        const toDate = dateRange?.to ? new Date(dateRange.to.getTime() + 24*60*60*1000 - 1) : (dateRange?.from ? new Date(dateRange.from.getTime() + 24*60*60*1000-1) : undefined);

        const filteredEntries = journalEntries.filter(entry => {
            if (!fromDate || !toDate) return true;
            const entryDate = parseISO(entry.date);
            return isWithinInterval(entryDate, { start: fromDate, end: toDate });
        });

        const incomeEntries = filteredEntries.filter(e => e.type === 'Ingreso' && e.status !== 'Anulada');
        const expenseEntries = filteredEntries.filter(e => e.type === 'Egreso' && e.status !== 'Anulada');

        const totalIncome = incomeEntries.reduce((sum, entry) => {
            const entryTotal = entry.lines.reduce((lineSum, line) => lineSum + line.credit, 0);
            return sum + entryTotal;
        }, 0);

        const totalExpenses = expenseEntries.reduce((sum, entry) => {
            const entryTotal = entry.lines.reduce((lineSum, line) => lineSum + line.debit, 0);
            return sum + entryTotal;
        }, 0);

        const netProfit = totalIncome - totalExpenses;

        const chartData = (fromDate && toDate) ? eachMonthOfInterval({ start: fromDate, end: toDate }).map(monthStart => {
            const monthEnd = endOfMonth(monthStart);
            const monthName = format(monthStart, 'MMM yyyy', { locale: es });

            const monthlyIncome = incomeEntries
                .filter(e => isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }))
                .reduce((sum, entry) => sum + entry.lines.reduce((lineSum, line) => lineSum + line.credit, 0), 0);

            const monthlyExpenses = expenseEntries
                .filter(e => isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }))
                .reduce((sum, entry) => sum + entry.lines.reduce((lineSum, line) => lineSum + line.debit, 0), 0);

            return {
                name: monthName,
                income: monthlyIncome,
                expenses: monthlyExpenses,
            }
        }) : [];

        return { totalIncome, totalExpenses, netProfit, chartData };
    }, [dateRange, journalEntries]);

    return {
        processedData,
        isLoading
    };
};
