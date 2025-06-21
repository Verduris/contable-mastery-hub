
import { FinancialMetricsCards } from "@/components/dashboard/FinancialMetricsCards";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { PieCharts } from "@/components/dashboard/PieCharts";
import { useDashboardData } from "@/hooks/reports/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { 
    metrics, 
    incomeExpenseData, 
    overdueReceivablesData, 
    payablesData, 
    receivables, 
    payables, 
    clientMap,
    isLoading 
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de tu negocio</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="lg:col-span-3 h-80" />
          <Skeleton className="lg:col-span-1 h-80" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de tu negocio</p>
      </div>
      
      <FinancialMetricsCards metrics={metrics} />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <IncomeExpenseChart data={incomeExpenseData} />
        <AlertsCard 
          receivables={receivables} 
          payables={payables} 
          clientMap={clientMap} 
        />
      </div>
      
      <PieCharts 
        overdueReceivablesData={overdueReceivablesData} 
        payablesData={payablesData} 
      />
    </div>
  );
};

export default Dashboard;
