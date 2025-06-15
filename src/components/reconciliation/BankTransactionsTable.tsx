
import { BankTransaction } from "@/types/reconciliation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BankTransactionsTableProps {
    transactions: BankTransaction[];
    selectedTransaction: BankTransaction | null;
    onSelectTransaction: (transaction: BankTransaction) => void;
}

export const BankTransactionsTable = ({ transactions, selectedTransaction, onSelectTransaction }: BankTransactionsTableProps) => {

    const getStatusBadge = (status: BankTransaction['status']) => {
        switch (status) {
            case 'reconciled': return <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">Conciliado</Badge>;
            case 'mismatch': return <Badge variant="destructive">Diferencia</Badge>;
            default: return <Badge variant="outline">Pendiente</Badge>;
        }
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-center">Estatus</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map(t => (
                        <TableRow 
                            key={t.id}
                            onClick={() => onSelectTransaction(t)}
                            className={cn(
                                "cursor-pointer",
                                t.status === 'reconciled' && "bg-green-500/10 hover:bg-green-500/20",
                                selectedTransaction?.id === t.id && "bg-blue-500/20 hover:bg-blue-500/30"
                            )}
                        >
                            <TableCell>{format(new Date(t.date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                            <TableCell>{t.description}</TableCell>
                            <TableCell className={cn("text-right font-mono", t.type === 'credit' ? 'text-green-600' : 'text-destructive')}>
                                {t.type === 'credit' ? '+' : '-'} {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(t.amount)}
                            </TableCell>
                            <TableCell className="text-center">{getStatusBadge(t.status)}</TableCell>
                        </TableRow>
                    ))}
                     {transactions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No hay movimientos bancarios.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
