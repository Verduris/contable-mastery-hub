
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, CircleDollarSign, FileMinus, FilePlus, AlertCircle } from "lucide-react";
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

const StatCard = ({ title, value, icon: Icon, linkTo, colorClass }: { 
  title: string, 
  value: string, 
  icon: React.ElementType, 
  linkTo?: string, 
  colorClass?: string 
}) => {
  const content = (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", colorClass)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
};

interface FinancialMetrics {
  totalReceivable: number;
  totalPayable: number;
  netBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

interface FinancialMetricsCardsProps {
  metrics: FinancialMetrics;
}

export const FinancialMetricsCards = ({ metrics }: FinancialMetricsCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard 
        title="Total por Cobrar" 
        value={formatCurrency(metrics.totalReceivable)} 
        icon={FilePlus} 
        linkTo="/cuentas-por-cobrar" 
        colorClass="text-sky-500" 
      />
      <StatCard 
        title="Total por Pagar" 
        value={formatCurrency(metrics.totalPayable)} 
        icon={FileMinus} 
        linkTo="/cuentas-por-pagar" 
        colorClass="text-orange-500" 
      />
      <StatCard 
        title="Saldo Neto" 
        value={formatCurrency(metrics.netBalance)} 
        icon={CircleDollarSign} 
        colorClass={metrics.netBalance >= 0 ? 'text-green-500' : 'text-red-500'}
      />
      <StatCard 
        title="Ingresos del Mes" 
        value={formatCurrency(metrics.monthlyIncome)} 
        icon={ArrowUp} 
        linkTo="/polizas" 
        colorClass="text-emerald-500" 
      />
      <StatCard 
        title="Egresos del Mes" 
        value={formatCurrency(metrics.monthlyExpense)} 
        icon={ArrowDown} 
        linkTo="/polizas" 
        colorClass="text-rose-500" 
      />
    </div>
  );
};
