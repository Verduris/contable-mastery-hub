
import { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { fetchReceivables } from '@/queries/receivables';
import { fetchPayables } from '@/queries/payables';
import { initialClients } from '@/data/clients';
import { Client } from '@/types/client';

export interface RankingData {
    name: string;
    total: number;
}

export function useRankingReport() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    const { data: initialReceivables = [] } = useQuery({ queryKey: ['receivables'], queryFn: fetchReceivables });
    const { data: initialPayables = [] } = useQuery({ queryKey: ['payables'], queryFn: fetchPayables });

    const clientMap = useMemo(() => {
        return new Map<string, Client>(initialClients.map(c => [c.id, c]));
    }, []);

    const topClients = useMemo((): RankingData[] => {
        if (!dateRange?.from || !dateRange?.to) return [];

        const interval = { start: dateRange.from, end: dateRange.to };
        const incomeByClient: { [key: string]: number } = {};

        initialReceivables.forEach(receivable => {
            receivable.paymentHistory?.forEach(payment => {
                if (isWithinInterval(parseISO(payment.date), interval)) {
                    incomeByClient[receivable.clientId] = (incomeByClient[receivable.clientId] || 0) + payment.amount;
                }
            });
        });

        return Object.entries(incomeByClient)
            .map(([clientId, total]) => ({
                name: clientMap.get(clientId)?.name || 'Cliente Desconocido',
                total,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    }, [dateRange, clientMap, initialReceivables]);

    const topSuppliers = useMemo((): RankingData[] => {
        if (!dateRange?.from || !dateRange?.to) return [];

        const interval = { start: dateRange.from, end: dateRange.to };
        const expensesBySupplier: { [key: string]: number } = {};
        
        const supplierMap = clientMap;

        initialPayables.forEach(payable => {
            payable.paymentHistory?.forEach(payment => {
                if (isWithinInterval(parseISO(payment.date), interval)) {
                    expensesBySupplier[payable.supplierId] = (expensesBySupplier[payable.supplierId] || 0) + payment.amount;
                }
            });
        });

        return Object.entries(expensesBySupplier)
            .map(([supplierId, total]) => ({
                name: supplierMap.get(supplierId)?.name || 'Proveedor Desconocido',
                total,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    }, [dateRange, clientMap, initialPayables]);

    return {
        dateRange,
        setDateRange,
        topClients,
        topSuppliers,
    };
}
