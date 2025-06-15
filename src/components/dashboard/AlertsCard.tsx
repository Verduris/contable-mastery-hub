
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { differenceInDays, parseISO } from 'date-fns';

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

interface Receivable {
  id: string;
  clientId: string;
  outstandingBalance: number;
  status: string;
  dueDate: string;
}

interface Payable {
  id: string;
  supplierId: string;
  outstandingBalance: number;
  status: string;
}

interface AlertsCardProps {
  receivables: Receivable[];
  payables: Payable[];
  clientMap: Map<string, string>;
}

export const AlertsCard = ({ receivables, payables, clientMap }: AlertsCardProps) => {
  const topOverdueReceivables = receivables
    .filter(r => r.status === 'Vencida')
    .sort((a, b) => differenceInDays(new Date(), parseISO(b.dueDate)) - differenceInDays(new Date(), parseISO(a.dueDate)))
    .slice(0, 3);
    
  const topOverduePayables = payables
    .filter(p => p.status === 'Vencida')
    .sort((a, b) => b.outstandingBalance - a.outstandingBalance)
    .slice(0, 3);

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
          Alertas Importantes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <h4 className="font-semibold text-destructive">CXC Vencidas (Top 3)</h4>
          {topOverdueReceivables.length > 0 ? (
            <ul className="list-disc pl-5 text-muted-foreground">
              {topOverdueReceivables.map(r => (
                <li key={r.id}>
                  {clientMap.get(r.clientId)} - {formatCurrency(r.outstandingBalance)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No hay cuentas por cobrar vencidas.</p>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-destructive">CXP Vencidas (Top 3)</h4>
          {topOverduePayables.length > 0 ? (
            <ul className="list-disc pl-5 text-muted-foreground">
              {topOverduePayables.map(p => (
                <li key={p.id}>
                  {clientMap.get(p.supplierId)} - {formatCurrency(p.outstandingBalance)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No hay cuentas por pagar vencidas.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
