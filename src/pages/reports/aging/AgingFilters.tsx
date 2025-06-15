
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client } from '@/types/client';
import { AgingFilterType } from '@/hooks/reports/useAgingReport';

interface AgingFiltersProps {
    typeFilter: AgingFilterType;
    onTypeFilterChange: (value: AgingFilterType) => void;
    entityFilter: string;
    onEntityFilterChange: (value: string) => void;
    dateRange: DateRange | undefined;
    onDateRangeChange: (date: DateRange | undefined) => void;
    entities: Client[];
}

export const AgingFilters = ({
    typeFilter,
    onTypeFilterChange,
    entityFilter,
    onEntityFilterChange,
    dateRange,
    onDateRangeChange,
    entities,
}: AgingFiltersProps) => {
    return (
        <div className="p-6 pt-0 flex flex-wrap items-center gap-4">
            <Select value={typeFilter} onValueChange={onTypeFilterChange}>
                <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Todos">Todos los tipos</SelectItem>
                    <SelectItem value="CXC">Cuentas por Cobrar</SelectItem>
                    <SelectItem value="CXP">Cuentas por Pagar</SelectItem>
                </SelectContent>
            </Select>

            <Select value={entityFilter} onValueChange={onEntityFilterChange}>
                <SelectTrigger className="w-full sm:w-auto sm:min-w-[240px]">
                    <SelectValue placeholder="Filtrar por Cliente/Proveedor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Todos">Todos los Clientes/Proveedores</SelectItem>
                    {entities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={'outline'}
                        className={cn(
                            'w-full sm:w-auto sm:min-w-[280px] justify-start text-left font-normal',
                            !dateRange && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, 'LLL dd, y', { locale: es })} -{' '}
                                    {format(dateRange.to, 'LLL dd, y', { locale: es })}
                                </>
                            ) : (
                                format(dateRange.from, 'LLL dd, y', { locale: es })
                            )
                        ) : (
                            <span>Rango de fecha de vencimiento</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={onDateRangeChange}
                        numberOfMonths={2}
                        locale={es}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};
