
import { Client } from "@/types/client";
import { Badge } from "@/components/ui/badge";
import { accounts } from "@/data/accounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ClientDetailsProps {
  client: Client;
}

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-sm">{value || 'N/A'}</p>
  </div>
);

export const ClientDetails = ({ client }: ClientDetailsProps) => {
  const associatedAccount = accounts.find(acc => acc.id === client.associatedAccountId);

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-4">
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
            <CardTitle className="text-base">Documentos Adjuntos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">La funcionalidad para adjuntar y ver contratos estará disponible próximamente.</p>
          </CardContent>
        </Card>
    </div>
  );
};
