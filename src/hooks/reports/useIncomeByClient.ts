
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchClients } from '@/queries/clients';
import { fetchJournalEntries } from '@/queries/journalEntries';
import { fetchReceivables } from '@/queries/receivables';
import type { DateRange } from 'react-day-picker';
import type { JournalEntryStatus } from '@/types/journal';
import { isWithinInterval, parseISO } from 'date-fns';

interface UseIncomeByClientParams {
    dateRange: DateRange | undefined;
    selectedClientId: string;
    selectedStatus: JournalEntryStatus | 'all';
}

export const useIncomeByClient = ({ dateRange, selectedClientId, selectedStatus }: UseIncomeByClientParams) => {
    const { data: clients = [], isLoading: isLoadingClients } = useQuery({ 
        queryKey: ['clients'], 
        queryFn: fetchClients 
    });
    
    const { data: journalEntries = [], isLoading: isLoadingJournalEntries } = useQuery({ 
        queryKey: ['journalEntries'], 
        queryFn: () => fetchJournalEntries() 
    });
    
    const { data: receivables = [] } = useQuery({ 
        queryKey: ['receivables'], 
        queryFn: fetchReceivables 
    });

    const calculateEntryTotal = (lines: any[]) => {
        return lines.reduce((sum, line) => sum + line.debit, 0);
    };

    const reportData = useMemo(() => {
        if (isLoadingClients || isLoadingJournalEntries) return [];
        
        const clientMap = new Map(clients.map(c => [c.id, c]));

        const filteredEntries = journalEntries.filter(entry => {
            if (entry.type !== 'Ingreso') return false;
            if (selectedStatus !== 'all' && entry.status !== selectedStatus) return false;
            if (selectedClientId !== 'all' && entry.clientId !== selectedClientId) return false;
            
            if (dateRange?.from || dateRange?.to) {
                const entryDate = parseISO(entry.date);
                if (dateRange?.from && entryDate < dateRange.from) return false;
                if (dateRange?.to && entryDate > dateRange.to) return false;
            }
            
            return true;
        });

        const incomeByClient = filteredEntries.reduce((acc, entry) => {
            if (!entry.clientId) return acc;
            if (!acc[entry.clientId]) {
                acc[entry.clientId] = { totalAmount: 0, count: 0 };
            }
            acc[entry.clientId].totalAmount += calculateEntryTotal(entry.lines);
            acc[entry.clientId].count++;
            return acc;
        }, {} as Record<string, { totalAmount: number; count: number }>);
        
        return Object.entries(incomeByClient).map(([clientId, data]) => {
            const client = clientMap.get(clientId);
            return {
                clientId,
                clientName: client?.name || 'Cliente Desconocido',
                totalIncomeEntries: data.count,
                totalAmountReceived: data.totalAmount,
                currentBalance: client?.balance || 0,
            };
        }).sort((a, b) => b.totalAmountReceived - a.totalAmountReceived);
    }, [journalEntries, clients, dateRange, selectedClientId, selectedStatus, isLoadingClients, isLoadingJournalEntries]);

    return {
        reportData,
        clients,
        isLoading: isLoadingClients || isLoadingJournalEntries
    };
};
