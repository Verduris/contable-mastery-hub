
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientStatus } from "@/types/client";

interface ClientFiltersProps {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    statusFilter: ClientStatus | "Todos";
    onStatusFilterChange: (value: ClientStatus | "Todos") => void;
}

export const ClientFilters = ({ searchTerm, onSearchTermChange, statusFilter, onStatusFilterChange }: ClientFiltersProps) => {
    return (
        <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
            <Input 
              placeholder="Buscar por nombre o RFC..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as ClientStatus | "Todos")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
        </div>
    );
};
