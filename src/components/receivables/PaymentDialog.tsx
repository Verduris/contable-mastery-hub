
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AccountReceivable } from '@/types/receivable';
import { Client } from '@/types/client';

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  receivable: AccountReceivable | null;
  paymentAmount: number;
  onPaymentAmountChange: (amount: number) => void;
  onRecordPayment: () => void;
}

export const PaymentDialog = ({
  isOpen,
  onOpenChange,
  receivable,
  paymentAmount,
  onPaymentAmountChange,
  onRecordPayment,
}: PaymentDialogProps) => {
  if (!receivable) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Cobro</DialogTitle>
          <DialogDescription>
            Cliente: {receivable.client?.name}
            <br />
            Saldo pendiente: {receivable.outstandingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="payment-amount" className="text-right">Monto</label>
            <Input
              id="payment-amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => onPaymentAmountChange(Math.min(Number(e.target.value), receivable.outstandingBalance || 0))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onRecordPayment}>Guardar Cobro</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
