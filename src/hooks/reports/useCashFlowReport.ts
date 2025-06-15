
import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { initialPayables } from '@/data/payables';
import { initialReceivables } from '@/data/receivables';
import { initialClients } from '@/data/clients';
import {
    eachDayOfInterval,
    isWithinInterval,
    startOfDay,
    endOfDay,
    format,
    parseISO,
    subMonths,
} from 'date-fns';

interface UseCashFlowReportProps {
    date: DateRange | undefined;
    selectedEntity: string;
}

export const useCashFlowReport = ({ date, selectedEntity }: UseCashFlowReportProps) => {
    const clientsAndSuppliers = useMemo(() => initialClients, []);

    const defaultDateRange: DateRange = useMemo(() => ({
        from: subMonths(new Date(), 1),
        to: new Date(),
    }), []);

    const { from, to } = date || defaultDateRange;

    const data = useMemo(() => {
        if (!from || !to) return [];

        const interval = { start: startOfDay(from), end: endOfDay(to) };
        
        const incomePayments = initialReceivables
            .filter(r => selectedEntity === 'todos' || r.clientId === selectedEntity)
            .flatMap(r => r.paymentHistory || [])
            .filter(p => isWithinInterval(parseISO(p.date), interval));
            
        const expensePayments = initialPayables
            .filter(p => selectedEntity === 'todos' || p.supplierId === selectedEntity)
            .flatMap(p => p.paymentHistory || [])
            .filter(p => isWithinInterval(parseISO(p.date), interval));
            
        const dailyData = new Map<string, { income: number; expenses: number }>();

        incomePayments.forEach(p => {
            const day = format(parseISO(p.date), 'yyyy-MM-dd');
            const current = dailyData.get(day) || { income: 0, expenses: 0 };
            current.income += p.amount;
            dailyData.set(day, current);
        });

        expensePayments.forEach(p => {
            const day = format(parseISO(p.date), 'yyyy-MM-dd');
            const current = dailyData.get(day) || { income: 0, expenses: 0 };
            current.expenses += p.amount;
            dailyData.set(day, current);
        });

        const daysInInterval = eachDayOfInterval(interval);
        let accumulated = 0;

        return daysInInterval.map(day => {
            const formattedDate = format(day, 'yyyy-MM-dd');
            const data = dailyData.get(formattedDate) || { income: 0, expenses: 0 };
            const net = data.income - data.expenses;
            accumulated += net;
            return {
                date: format(day, 'dd/MM/yy'),
                income: data.income,
                expenses: data.expenses,
                net,
                accumulated,
            };
        });
    }, [from, to, selectedEntity]);

    const summary = useMemo(() => {
        const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
        const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
        const netFlow = totalIncome - totalExpenses;
        return { totalIncome, totalExpenses, netFlow };
    }, [data]);

    return {
        data,
        summary,
        clientsAndSuppliers,
    };
};
