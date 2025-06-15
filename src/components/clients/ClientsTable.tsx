
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
import { Eye, FileText, CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Client } from "@/types/client";
import { JournalEntry } from "@/types/journal";
import { compareAsc, differenceInDays } from "date-fns";

interface ClientsTableProps {
  clients: Client[];
  journalEntries: JournalEntry[];
  onViewDetails: (client: Client) => void;
}

const getClientHealthStatus = (client: Client, journalEntries: JournalEntry[]) => {
    const clientEntries = journalEntries
      .filter(entry => entry.clientId === client.id)
      .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)));

    const lastPayment = clientEntries.filter(e => e.type === 'Egreso').pop();
    const daysSinceLastPayment = lastPayment ? differenceInDays(new Date(), new Date(lastPayment.date)) : Infinity;

    const isDelinquent = (client.creditDays ?? 0) > 0 && daysSinceLastPayment > (client.creditDays ?? 0) && client.balance > 0;
    const hasExhaustedCredit = (client.creditLimit ?? 0) > 0 && client.balance >= (client.creditLimit ?? 0);
    const hasNegativeBalance = client.balance < 0;

    const alertMessages = [];
    if (isDelinquent) alertMessages.push("Cliente en mora.");
    if (hasExhaustedCredit) alertMessages.push("Límite de crédito agotado o excedido.");
    if (hasNegativeBalance) alertMessages.push("Cliente con saldo a favor (negativo).");

    return { hasAlert: alertMessages.length > 0, message: alertMessages.join(' ') };
}

export const ClientsTable = ({ clients, journalEntries, onViewDetails }: ClientsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">Nombre / Razón Social</TableHead>
          <TableHead>RFC</TableHead>
          <TableHead>Estatus</TableHead>
          <TableHead className="text-right">Saldo</TableHead>
          <TableHead className="text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => {
          const health = getClientHealthStatus(client, journalEntries);
          return (
          <TableRow key={client.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {client.name}
                {health.hasAlert && (
                    <Tooltip>
                      <TooltipTrigger>
                        <CircleAlert className="h-4 w-4 text-destructive" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{health.message}</p>
                      </TooltipContent>
                    </Tooltip>
                )}
              </div>
            </TableCell>
            <TableCell>{client.rfc}</TableCell>
            <TableCell>
              <Badge variant={client.status === 'Activo' ? 'default' : 'destructive'}>
                {client.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono">
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(client.balance)}
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center">
                <Button variant="ghost" size="icon" onClick={() => onViewDetails(client)}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Ver detalles</span>
                </Button>
                <Button asChild variant="ghost" size="icon">
                  <Link to={`/clientes/${client.id}/estado-de-cuenta`}>
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">Ver estado de cuenta</span>
                  </Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )})}
      </TableBody>
    </Table>
  );
};
