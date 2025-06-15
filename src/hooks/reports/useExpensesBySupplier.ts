
import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

import { fetchPayables } from '@/queries/payables';
import { fetchJournalEntries } from '@/queries/journalEntries';
import { fetchClients } from '@/queries/invoices';
import type { JournalEntryStatus } from '@/types/journal';

export const journalStatusOptions: { value: JournalEntryStatus | 'todos'; label: string }[] = [
    { value: 'todos', label: 'Todos los estatus' },
    { value: 'Borrador', label: 'Borrador' },
    { value: 'Revisada', label: 'Revisada' },
    { value: 'Anulada', label: 'Anulada' },
];

interface UseExpensesBySupplierParams {
    date: DateRange | undefined;
    selectedSupplier: string;
    selectedStatus: JournalEntryStatus | 'todos';
}

export const useExpensesBySupplier = ({ date, selectedSupplier, selectedStatus }: UseExpensesBySupplierParams) => {
    const { data: initialPayables = [] } = useQuery({ queryKey: ['payables'], queryFn: fetchPayables });
    const { data: journalEntries = [] } = useQuery({ queryKey: ['journalEntries'], queryFn: fetchJournalEntries });
    const { data: suppliers = [] } = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
    
    const supplierMap = useMemo(() => new Map(suppliers.map(c => [c.id, c.name])), [suppliers]);

    const filteredData = useMemo(() => {
        const fromDate = date?.from;
        const toDate = date?.to || (date?.from ? new Date(date.from.getTime() + 24 * 60 * 60 * 1000 -1) : undefined);

        const relevantSupplierIdsFromPayables = new Set(initialPayables.map(p => p.supplierId));
        const relevantSupplierIdsFromJournals = new Set(journalEntries.filter(j => j.type === 'Egreso' && j.clientId).map(j => j.clientId!));
        const allSupplierIds = new Set([...relevantSupplierIdsFromPayables, ...relevantSupplierIdsFromJournals]);

        const data = Array.from(allSupplierIds).map(supplierId => {
            const payables = initialPayables.filter(p => 
                p.supplierId === supplierId &&
                (!fromDate || !toDate || isWithinInterval(new Date(p.issueDate), { start: fromDate, end: toDate }))
            );
            
            const journals = journalEntries.filter(j => 
                j.clientId === supplierId && j.type === 'Egreso' &&
                (selectedStatus === 'todos' || j.status === selectedStatus) &&
                (!fromDate || !toDate || isWithinInterval(new Date(j.date), { start: fromDate, end: toDate }))
            );

            const totalPaid = payables.reduce((sum, p) => sum + p.paidAmount, 0);
            const outstandingBalance = payables.reduce((sum, p) => sum + p.outstandingBalance, 0);

            return {
                supplierId,
                supplierName: supplierMap.get(supplierId) || `Proveedor Desconocido (${supplierId})`,
                policyCount: journals.length,
                totalPaid,
                outstandingBalance,
            }
        });

        let result = data.filter(d => d.policyCount > 0 || d.totalPaid > 0 || d.outstandingBalance > 0);

        if (selectedSupplier !== 'todos') {
            result = result.filter(item => item.supplierId === selectedSupplier);
        }

        return result;

    }, [date, selectedSupplier, selectedStatus, supplierMap, initialPayables, journalEntries]);

    return { filteredData, suppliers, journalStatusOptions };
};
