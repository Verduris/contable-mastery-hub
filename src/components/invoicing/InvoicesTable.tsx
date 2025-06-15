
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, FileDown, Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Invoice } from "@/types/invoice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InvoicesTableProps {
  invoices: Invoice[];
  clientMap: Map<string, string>;
  onDownloadXML: (invoice: Invoice) => void;
  onDownloadPDF: (invoice: Invoice) => void;
}

export const InvoicesTable = ({
  invoices,
  clientMap,
  onDownloadXML,
  onDownloadPDF,
}: InvoicesTableProps) => {
  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Fecha</TableHead>
            <TableHead>Folio Fiscal (UUID)</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estatus SAT</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Póliza</TableHead>
            <TableHead className="text-center w-[120px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24">
                No se encontraron facturas con los filtros seleccionados.
              </TableCell>
            </TableRow>
          )}
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              className={cn(
                invoice.satStatus === "Cancelada" &&
                  "bg-gray-50 text-muted-foreground"
              )}
            >
              <TableCell>
                {format(new Date(invoice.date), "dd/MMM/yyyy", { locale: es })}
              </TableCell>
              <TableCell className="font-mono text-xs">{invoice.uuid}</TableCell>
              <TableCell>{clientMap.get(invoice.clientId) || "N/A"}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    invoice.satStatus === "Cancelada" ? "destructive" : "default"
                  }
                  className={cn(
                    invoice.satStatus === "Vigente" && "bg-green-600"
                  )}
                >
                  {invoice.satStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono">
                {invoice.amount.toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN",
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {invoice.journalEntry ? (
                    <Button
                      variant="link"
                      asChild
                      className="p-0 h-auto font-normal"
                    >
                      <Link to="/polizas">
                        <FileText className="mr-2 h-4 w-4" />
                        {invoice.journalEntry.number}
                      </Link>
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Factura no asociada a una póliza contable.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownloadXML(invoice)}
                        disabled={!invoice.fileName}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Descargar XML</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Descargar XML</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownloadPDF(invoice)}
                      >
                        <FileDown className="h-4 w-4 text-red-600" />
                        <span className="sr-only">Descargar PDF</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Descargar PDF</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
};
