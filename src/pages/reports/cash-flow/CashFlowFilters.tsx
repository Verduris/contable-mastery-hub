
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client } from "@/types/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, RotateCcw } from "lucide-react";
import type { DateRange } from "react-day-picker";

interface CashFlowFiltersProps {
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
    selectedEntity: string;
    setSelectedEntity: (id: string) => void;
    entities: Client[];
    clearFilters: () => void;
}

export const CashFlowFilters = ({ date, setDate, selectedEntity, setSelectedEntity, entities, clearFilters }: CashFlowFiltersProps) => {
    return (
        <div className="flex flex-col md:flex-row items-center gap-4">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className="w-full md:w-[280px] justify-start text-left font-normal"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                `${format(date.from, "dd LLL, y", { locale: es })} - ${format(date.to, "dd LLL, y", { locale: es })}`
                            ) : (
                                format(date.from, "dd LLL, y")
                            )
                        ) : (
                            <span>Selecciona un rango de fechas</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={date} onSelect={setDate} numberOfMonths={2} />
                </PopoverContent>
            </Popover>

            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Filtrar por Cliente/Proveedor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos los Clientes/Proveedores</SelectItem>
                    {entities.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
            </Select>

            <Button onClick={clearFilters} variant="ghost" className="text-sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                Limpiar Filtros
            </Button>
        </div>
    );
};
