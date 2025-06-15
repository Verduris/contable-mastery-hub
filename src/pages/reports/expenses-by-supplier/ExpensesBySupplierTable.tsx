
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ExpenseData {
    supplierId: string;
    supplierName: string;
    policyCount: number;
    totalPaid: number;
    outstandingBalance: number;
}

interface ExpensesBySupplierTableProps {
    data: ExpenseData[];
}

export const ExpensesBySupplierTable = ({ data }: ExpensesBySupplierTableProps) => {
    return (
        <Card>
            <CardHeader>
                 <CardTitle>Datos Detallados</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Proveedor</TableHead>
                            <TableHead className="text-center">Nº de Pólizas</TableHead>
                            <TableHead className="text-right">Total Pagado</TableHead>
                            <TableHead className="text-right">Saldo Pendiente</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? data.map((item) => (
                            <TableRow key={item.supplierId}>
                                <TableCell className="font-medium">{item.supplierName}</TableCell>
                                <TableCell className="text-center">{item.policyCount}</TableCell>
                                <TableCell className="text-right">{item.totalPaid.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                                <TableCell className="text-right">{item.outstandingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No se encontraron datos con los filtros seleccionados.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
