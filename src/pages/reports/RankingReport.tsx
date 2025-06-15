
import { Card } from '@/components/ui/card';
import { useRankingReport } from '@/hooks/reports/useRankingReport';
import { RankingHeader, RankingFilters, TopClientsChart, TopSuppliersChart } from './ranking';
import { useToast } from '@/hooks/use-toast';

const RankingReport = () => {
  const { toast } = useToast();
  const { dateRange, setDateRange, topClients, topSuppliers } = useRankingReport();

  const handleExport = () => {
    toast({
      title: 'Función no implementada',
      description: 'La exportación a PDF estará disponible próximamente.',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <RankingHeader onExport={handleExport} />
        <RankingFilters dateRange={dateRange} setDateRange={setDateRange} />
      </Card>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <TopClientsChart data={topClients} />
        <TopSuppliersChart data={topSuppliers} />
      </div>
    </div>
  );
};

export default RankingReport;
