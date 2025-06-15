
import { Card } from '@/components/ui/card';
import { useAgingReport } from '@/hooks/reports/useAgingReport';
import { AgingHeader, AgingFilters, AgingTable } from './aging';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const AgingReport = () => {
    const { toast } = useToast();
    const { 
        data, 
        typeFilter, 
        setTypeFilter, 
        entityFilter, 
        setEntityFilter, 
        dateRange, 
        setDateRange,
        entities,
    } = useAgingReport();

    const handleExport = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Vencimientos", 14, 16);

        const tableColumn = ["Tipo", "Cliente/Proveedor", "F. Vencimiento", "Días", "Saldo Pendiente", "Estatus"];
        const tableRows: any[] = [];

        data.forEach(item => {
            const row = [
                item.type,
                item.entityName,
                format(parseISO(item.dueDate), 'dd/MMM/yy', { locale: es }),
                item.days.toString(),
                item.outstandingBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
                item.status,
            ];
            tableRows.push(row);
        });

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save('reporte_vencimientos.pdf');
        toast({
            title: 'Reporte Exportado',
            description: 'El reporte de vencimientos ha sido exportado a PDF.',
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <AgingHeader onExport={handleExport} />
                <AgingFilters 
                    typeFilter={typeFilter}
                    onTypeFilterChange={setTypeFilter}
                    entityFilter={entityFilter}
                    onEntityFilterChange={setEntityFilter}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    entities={entities}
                />
                <AgingTable data={data} />
            </Card>
        </div>
    );
};

export default AgingReport;
