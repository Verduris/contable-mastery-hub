
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";

interface CashFlowTableProps {
    data: {
        date: string;
        income: number;
        expenses: number;
        net: number;
        accumulated: number;
    }[];
    summary: {
        totalIncome: number;
        totalExpenses: number;
        netFlow: number;
    };
}

const formatCurrency = (amount: number) => amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export const CashFlowTable = ({ data, summary }: CashFlowTableProps) => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Ingresos</TableHead>
                        <TableHead className="text-right">Egresos</TableHead>
                        <TableHead className="text-right">Flujo Neto</TableHead>
                        <TableHead className="text-right">Saldo Acumulado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.date}</TableCell>
                            <TableCell className="text-right text-green-600">{formatCurrency(item.income)}</TableCell>
                            <TableCell className="text-right text-red-600">{formatCurrency(item.expenses)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(item.net)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(item.accumulated)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-muted/50 font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{formatCurrency(summary.totalIncome)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(summary.totalExpenses)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(summary.netFlow)}</TableCell>
                        <TableCell />
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
};
