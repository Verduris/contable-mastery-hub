
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown } from "lucide-react";
import { AccountReceivableStatus } from "@/types/receivable";
import { Client } from "@/types/client";

interface ReceivablesHeaderProps {
  clients: Client[];
  isLoadingClients: boolean;
  clientFilter: string;
  setClientFilter: (value: string) => void;
  statusFilter: AccountReceivableStatus | "Todos";
  setStatusFilter: (value: AccountReceivableStatus | "Todos") => void;
  handleExportPDF: () => void;
}

export const ReceivablesHeader = ({
  clients,
  isLoadingClients,
  clientFilter,
  setClientFilter,
  statusFilter,
  setStatusFilter,
  handleExportPDF
}: ReceivablesHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <CardTitle>Cuentas por Cobrar (CXC)</CardTitle>
          <CardDescription>Gestiona y da seguimiento a los cobros pendientes.</CardDescription>
        </div>
        <Button onClick={handleExportPDF} variant="outline">
            <FileDown className="mr-2 h-4 w-4" /> Exportar a PDF
        </Button>
      </div>
      <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
        <Select value={clientFilter} onValueChange={setClientFilter} disabled={isLoadingClients}>
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los clientes</SelectItem>
            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
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
    </CardHeader>
  );
};
