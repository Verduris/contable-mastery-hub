
import { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, differenceInDays, parseISO, startOfDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { fetchReceivables } from '@/queries/receivables';
import { initialPayables } from '@/data/payables';
import { initialClients } from '@/data/clients';
import { AccountReceivableStatus } from '@/types/receivable';
import { AccountPayableStatus } from '@/types/payable';
import { Client } from '@/types/client';

export type AgingReportItem = {
  id: string;
  type: 'CXC' | 'CXP';
  entityId: string;
  entityName: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  outstandingBalance: number;
  status: 'Vencida' | 'Próxima a Vencer' | 'Pendiente' | 'Pagada';
  days: number;
  originalStatus: AccountReceivableStatus | AccountPayableStatus;
};

export type AgingFilterType = 'Todos' | 'CXC' | 'CXP';

export const useAgingReport = () => {
  const [typeFilter, setTypeFilter] = useState<AgingFilterType>('Todos');
  const [entityFilter, setEntityFilter] = useState<string>('Todos');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const { data: initialReceivables = [] } = useQuery({ queryKey: ['receivables'], queryFn: fetchReceivables });

  const clientMap = useMemo(() => new Map(initialClients.map(c => [c.id, c.name])), []);

  const combinedData = useMemo(() => {
    const today = startOfDay(new Date());

    const receivables: AgingReportItem[] = initialReceivables.map(r => {
      const days = differenceInDays(parseISO(r.dueDate), today);
      let status: AgingReportItem['status'] = 'Pendiente';
      if (r.status === 'Pagada') {
        status = 'Pagada';
      } else if (days < 0) {
        status = 'Vencida';
      } else if (days <= 5) {
        status = 'Próxima a Vencer';
      }
      return {
        id: r.id,
        type: 'CXC',
        entityId: r.clientId,
        entityName: clientMap.get(r.clientId) || 'N/A',
        issueDate: r.issueDate,
        dueDate: r.dueDate,
        totalAmount: r.totalAmount,
        outstandingBalance: r.outstandingBalance,
        status,
        days,
        originalStatus: r.status,
      };
    });

    const payables: AgingReportItem[] = initialPayables.map(p => {
      const days = differenceInDays(parseISO(p.dueDate), today);
      let status: AgingReportItem['status'] = 'Pendiente';
      if (p.status === 'Pagada') {
        status = 'Pagada';
      } else if (days < 0) {
        status = 'Vencida';
      } else if (days <= 3) {
        status = 'Próxima a Vencer';
      }
      return {
        id: p.id,
        type: 'CXP',
        entityId: p.supplierId,
        entityName: clientMap.get(p.supplierId) || 'N/A',
        issueDate: p.issueDate,
        dueDate: p.dueDate,
        totalAmount: p.totalAmount,
        outstandingBalance: p.outstandingBalance,
        status,
        days,
        originalStatus: p.status,
      };
    });

    return [...receivables, ...payables];
  }, [clientMap, initialReceivables, initialPayables]);

  const filteredData = useMemo(() => {
    return combinedData.filter(item => {
      const typeMatch = typeFilter === 'Todos' || item.type === typeFilter;
      const entityMatch = entityFilter === 'Todos' || item.entityId === entityFilter;
      
      let dateMatch = true;
      if (dateRange?.from && dateRange?.to) {
        const dueDate = parseISO(item.dueDate);
        dateMatch = dueDate >= dateRange.from && dueDate <= dateRange.to;
      } else if (dateRange?.from) {
        dateMatch = parseISO(item.dueDate) >= dateRange.from;
      }

      return typeMatch && entityMatch && dateMatch;
    }).sort((a, b) => a.days - b.days);
  }, [combinedData, typeFilter, entityFilter, dateRange]);
  
  const entities = useMemo((): Client[] => {
    if (typeFilter === 'Todos') {
        return initialClients;
    }
    const entityIds = new Set(combinedData.filter(i => i.type === typeFilter).map(i => i.entityId));
    return initialClients.filter(c => entityIds.has(c.id));
  }, [typeFilter, combinedData]);


  return {
    data: filteredData,
    typeFilter,
    setTypeFilter,
    entityFilter,
    setEntityFilter,
    dateRange,
    setDateRange,
    entities,
    clientMap,
  };
};
