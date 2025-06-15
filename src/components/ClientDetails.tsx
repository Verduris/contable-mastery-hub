
import { Client } from "@/types/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { journalEntries as allJournalEntries } from "@/data/journalEntries";
import { initialClientAuditLogs } from "@/data/clientAuditLogs";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { File, Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Account } from "@/types/account";

interface ClientDetailsProps {
  client: Client;
  accounts: Account[];
}

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-sm">{value || 'N/A'}</p>
  </div>
);

export const ClientDetails = ({ client, accounts }: ClientDetailsProps) => {
  const associatedAccount = accounts.find(acc => acc.id === client.associatedAccountId);

  const clientJournalEntries = allJournalEntries
    .filter(entry => entry.clientId === client.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const clientAuditLogs = initialClientAuditLogs.filter(log => log.clientId === client.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleUploadClick = () => {
    alert("La funcionalidad de carga de archivos estará disponible próximamente.");
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-4">
      <section>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold">{client.name}</h2>
            <p className="text-sm text-muted-foreground">{client.rfc}</p>
          </div>
          <Badge variant={client.status === 'Activo' ? 'default' : 'destructive'}>
            {client.status}
          </Badge>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetailItem label="Tipo Persona" value={client.type} />
            <DetailItem label="Régimen Fiscal" value={client.taxRegime} />
            <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Saldo Actual</p>
                <p className="text-lg font-mono font-semibold">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(client.balance)}</p>
            </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <DetailItem label="Correo Electrónico" value={<a href={`mailto:${client.email}`} className="text-primary hover:underline">{client.email}</a>} />
            <DetailItem label="Teléfono" value={<a href={`tel:${client.phone}`} className="text-primary hover:underline">{client.phone}</a>} />
            <div className="md:col-span-2">
                <DetailItem label="Dirección" value={client.address} />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Condiciones Comerciales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
           <DetailItem label="Cuenta Contable" value={associatedAccount ? `${associatedAccount.code} - ${associatedAccount.name}` : 'N/A'} />
           <DetailItem label="Límite de Crédito" value={client.creditLimit ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(client.creditLimit) : 'N/A'} />
           <DetailItem label="Días de Crédito" value={client.creditDays ? `${client.creditDays} días` : 'N/A'} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Últimas Operaciones</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to={`/clientes/${client.id}/estado-de-cuenta`}>
                <File className="mr-2 h-4 w-4" />
                Estado de Cuenta
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {clientJournalEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientJournalEntries.map(entry => {
                  const total = entry.lines.reduce((sum, line) => sum + line.debit, 0);
                  const amount = entry.type === 'Ingreso' ? total : -total;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{format(new Date(entry.date), 'P', { locale: es })}</TableCell>
                      <TableCell className="truncate max-w-xs">{entry.concept}</TableCell>
                      <TableCell className="text-right font-mono">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No hay operaciones recientes para este cliente.</p>
          )}
        </CardContent>
      </Card>
      
      {client.internalNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas Internas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.internalNotes}</p>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <File className="mr-2 h-4 w-4 text-muted-foreground" />
            Historial de Cambios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientAuditLogs.length > 0 ? (
            <ul className="space-y-4 text-sm">
              {clientAuditLogs.map(log => (
                <li key={log.id} className="relative pl-6">
                   <div className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full bg-primary/50"></div>
                   <p className="font-medium">{log.action}</p>
                   <p className="text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), 'Pp', { locale: es })} por <span className="font-semibold">{log.user}</span>
                  </p>
                  {log.details && <p className="text-xs text-muted-foreground italic pl-2">"{log.details}"</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No hay historial de cambios para este cliente.</p>
          )}
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
            <CardTitle className="text-base">Documentos Adjuntos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.contractUrl && (
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                <div className="flex items-center gap-3">
                  <File className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Contrato Principal</p>
                    <p className="text-xs text-muted-foreground">contract.pdf</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="icon">
                  <a href={client.contractUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-5 w-5" />
                     <span className="sr-only">Descargar</span>
                  </a>
                </Button>
              </div>
            )}
            <div 
              className="mt-4 p-6 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/30"
              onClick={handleUploadClick}
            >
                <File className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-primary font-semibold">
                  Subir nuevo documento
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Arrastra un archivo o haz clic aquí
                </p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};
