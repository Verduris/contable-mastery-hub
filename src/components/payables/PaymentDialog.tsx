
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountPayable } from '@/types/payable';

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPayable: AccountPayable | null;
  supplierMap: Map<string, string>;
  onRecordPayment: (amount: number) => void;
}

export const PaymentDialog = ({ isOpen, onOpenChange, selectedPayable, supplierMap, onRecordPayment }: PaymentDialogProps) => {
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  useEffect(() => {
    if (selectedPayable) {
      setPaymentAmount(selectedPayable.outstandingBalance);
    } else {
      setPaymentAmount(0);
    }
  }, [selectedPayable]);

  const handleSave = () => {
    onRecordPayment(paymentAmount);
  };

  if (!selectedPayable) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Proveedor: {supplierMap.get(selectedPayable.supplierId)}
            <br />
            Saldo pendiente: {selectedPayable.outstandingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="payment-amount" className="text-right">Monto</label>
            <Input
              id="payment-amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Math.min(Number(e.target.value), selectedPayable.outstandingBalance || 0))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar Pago</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
