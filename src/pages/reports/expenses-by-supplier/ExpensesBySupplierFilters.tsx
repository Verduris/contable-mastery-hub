
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Client } from "@/types/client";
import type { JournalEntryStatus } from "@/types/journal";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from "react-day-picker";

interface ExpensesBySupplierFiltersProps {
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
    selectedSupplier: string;
    setSelectedSupplier: (supplier: string) => void;
    selectedStatus: JournalEntryStatus | 'todos';
    setSelectedStatus: (status: JournalEntryStatus | 'todos') => void;
    suppliers: Client[];
    journalStatusOptions: { value: JournalEntryStatus | 'todos'; label: string }[];
    clearFilters: () => void;
}

export const ExpensesBySupplierFilters = ({
    date,
    setDate,
    selectedSupplier,
    setSelectedSupplier,
    selectedStatus,
    setSelectedStatus,
    suppliers,
    journalStatusOptions,
    clearFilters,
}: ExpensesBySupplierFiltersProps) => {
    return (
        <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full md:w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                                    {format(date.to, "LLL dd, y", { locale: es })}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y", { locale: es })
                            )
                        ) : (
                            <span>Selecciona un rango de fechas</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="w-full md:w-[240px]">
                    <SelectValue placeholder="Filtrar por proveedor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos los proveedores</SelectItem>
                    {suppliers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)}>
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Estatus de Póliza" />
                </SelectTrigger>
                <SelectContent>
                    {journalStatusOptions.map(opt => (
                         <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            
            <Button onClick={clearFilters}>Limpiar Filtros</Button>
        </div>
    );
};
