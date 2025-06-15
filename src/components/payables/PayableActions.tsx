
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Wallet, CircleCheck } from "lucide-react";
import { AccountPayable } from "@/types/payable";

interface PayableActionsProps {
  payable: AccountPayable;
  onOpenPaymentDialog: (payable: AccountPayable) => void;
  onMarkAsPaid: (payableId: string) => void;
}

export const PayableActions = ({ payable, onOpenPaymentDialog, onMarkAsPaid }: PayableActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={payable.status === 'Pagada'}>
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onOpenPaymentDialog(payable)}>
          <Wallet className="mr-2 h-4 w-4" /> Registrar Pago
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMarkAsPaid(payable.id)}>
          <CircleCheck className="mr-2 h-4 w-4" /> Marcar como Pagada
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
