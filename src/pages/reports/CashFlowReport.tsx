
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { DateRange } from 'react-day-picker';
import { useCashFlowReport } from '@/hooks/reports/useCashFlowReport';
import { CashFlowHeader, CashFlowFilters, CashFlowChart, CashFlowTable } from './cash-flow';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import { format, parse } from 'date-fns';

const CashFlowReport = () => {
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [selectedEntity, setSelectedEntity] = useState<string>('todos');
    const { toast } = useToast();

    const { data, summary, clientsAndSuppliers } = useCashFlowReport({
        date,
        selectedEntity,
    });
    
    const clearFilters = () => {
        setDate(undefined);
        setSelectedEntity('todos');
    };

    const handleExport = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Flujo de Caja", 14, 16);
        
        const tableColumn = ["Fecha", "Ingresos", "Egresos", "Flujo Neto", "Saldo Acumulado"];
        const tableRows: any[] = data.map(item => [
            item.date,
            item.income.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
            item.expenses.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
            item.net.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
            item.accumulated.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
        ]);

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 22,
            foot: [[
                'Total',
                summary.totalIncome.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
                summary.totalExpenses.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
                summary.netFlow.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
                ''
            ]],
            showFoot: 'lastPage'
        });
        
        doc.save('reporte_flujo_caja.pdf');
        toast({ title: "PDF Exportado", description: "El reporte de flujo de caja ha sido exportado." });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CashFlowHeader onExport={handleExport} />
                <CardContent className="space-y-6">
                    <CashFlowFilters
                        date={date}
                        setDate={setDate}
                        selectedEntity={selectedEntity}
                        setSelectedEntity={setSelectedEntity}
                        entities={clientsAndSuppliers}
                        clearFilters={clearFilters}
                    />
                    <CashFlowChart data={data} />
                    <CashFlowTable data={data} summary={summary} />
                </CardContent>
            </Card>
        </div>
    );
};

export default CashFlowReport;
