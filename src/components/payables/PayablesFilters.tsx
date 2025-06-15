
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccountPayableStatus } from '@/types/payable';
import { Client } from '@/types/client';

interface PayablesFiltersProps {
    supplierFilter: string;
    onSupplierFilterChange: (value: string) => void;
    statusFilter: AccountPayableStatus | "Todos";
    onStatusFilterChange: (value: AccountPayableStatus | "Todos") => void;
    suppliers: Client[];
}

export const PayablesFilters = ({ supplierFilter, onSupplierFilterChange, statusFilter, onStatusFilterChange, suppliers }: PayablesFiltersProps) => {
    return (
        <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
            <Select value={supplierFilter} onValueChange={onSupplierFilterChange}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="Filtrar por proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los proveedores</SelectItem>
                {suppliers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as any)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los estatus</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Parcialmente Pagada">Parcialmente Pagada</SelectItem>
                <SelectItem value="Vencida">Vencida</SelectItem>
                <SelectItem value="Pagada">Pagada</SelectItem>
              </SelectContent>
            </Select>
        </div>
    );
};
