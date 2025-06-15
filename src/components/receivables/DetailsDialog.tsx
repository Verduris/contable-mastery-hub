
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AccountReceivable } from '@/types/receivable';
import { Client } from '@/types/client';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface DetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  receivable: AccountReceivable | null;
  clientData: Map<string, Client>;
}

export const DetailsDialog = ({
  isOpen,
  onOpenChange,
  receivable,
  clientData,
}: DetailsDialogProps) => {
  if (!receivable) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de la Cuenta por Cobrar</DialogTitle>
          <DialogDescription>
            Cliente: {clientData.get(receivable.clientId)?.name}
            <br />
            Factura ID: {receivable.invoiceId || 'N/A'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <h4 className="font-semibold mb-2 text-sm">Notas Internas</h4>
            <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md min-h-[60px]">{receivable.notes || 'No hay notas.'}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm">Historial de Pagos</h4>
            {receivable.paymentHistory && receivable.paymentHistory.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivable.paymentHistory.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{format(parseISO(p.date), 'dd/MMM/yyyy', { locale: es })}</TableCell>
                        <TableCell className="text-muted-foreground">{p.notes || ''}</TableCell>
                        <TableCell className="text-right font-mono">{p.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No hay pagos registrados.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
