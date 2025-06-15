
import React from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { AccountReceivable, AccountReceivableStatus } from '@/types/receivable';
import { CircleCheck, CircleX, CircleAlert } from 'lucide-react';

export const getStatusInfo = (receivable: AccountReceivable): { icon: React.ReactNode, tooltip: string, colorClass: string } => {
    const daysDiff = differenceInDays(parseISO(receivable.dueDate), new Date());
    
    if (receivable.status === 'Pagada') {
      return { icon: <CircleCheck className="h-4 w-4 text-green-500" />, tooltip: 'Pagada', colorClass: 'text-green-500' };
    }
    if (receivable.status === 'Vencida' || daysDiff < 0) {
      return { icon: <CircleX className="h-4 w-4 text-destructive" />, tooltip: `Vencida por ${Math.abs(daysDiff)} días`, colorClass: 'text-destructive' };
    }
    if (daysDiff >= 0 && daysDiff <= 5) {
      return { icon: <CircleAlert className="h-4 w-4 text-yellow-500" />, tooltip: `Vence en ${daysDiff} días`, colorClass: 'text-yellow-500' };
    }
    return { icon: null, tooltip: `Vence en ${daysDiff} días`, colorClass: '' };
};

export const getBadgeVariant = (status: AccountReceivableStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Pagada': return 'default';
      case 'Vencida': return 'destructive';
      case 'Parcialmente Pagada': return 'secondary';
      case 'Pendiente': return 'outline';
      default: return 'outline';
    }
};
