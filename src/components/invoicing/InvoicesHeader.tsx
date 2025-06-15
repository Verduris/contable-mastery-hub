
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { Client } from "@/types/client";
import { SatStatus, Invoice } from "@/types/invoice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { AddInvoiceForm } from "@/components/AddInvoiceForm";

interface InvoicesHeaderProps {
  clients: Client[];
  filters: {
    client: string;
    status: SatStatus | "Todos";
    uuid: string;
  };
  onFiltersChange: (
    filters: Partial<InvoicesHeaderProps["filters"]>
  ) => void;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  onSaveInvoice: (invoice: Invoice, file: File) => void;
}

export const InvoicesHeader = ({
  clients,
  filters,
  onFiltersChange,
  isDialogOpen,
  onDialogOpenChange,
  onSaveInvoice,
}: InvoicesHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <CardTitle>Facturación (CFDI Emitidos)</CardTitle>
          <CardDescription>
            Administra las facturas emitidas a tus clientes.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Factura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Factura (CFDI)</DialogTitle>
              <DialogDescription>
                Sube el archivo XML para llenar los datos automáticamente.
              </DialogDescription>
            </DialogHeader>
            <AddInvoiceForm
              clients={clients}
              onSave={onSaveInvoice}
              onCancel={() => onDialogOpenChange(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4 flex flex-col md:flex-row items-center gap-4 flex-wrap">
        <Input
          placeholder="Buscar por Folio Fiscal (UUID)..."
          value={filters.uuid}
          onChange={(e) => onFiltersChange({ uuid: e.target.value })}
          className="w-full md:w-auto md:flex-1"
        />
        <Select
          value={filters.client}
          onValueChange={(value) => onFiltersChange({ client: value })}
        >
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los clientes</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({ status: value as any })
          }
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrar por estatus SAT" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los estatus</SelectItem>
            <SelectItem value="Vigente">Vigente</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
  );
};
