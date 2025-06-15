
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BarChart, LineChart } from 'lucide-react';

const reports = [
    {
        title: 'Ingresos por Cliente',
        description: 'Analiza los ingresos totales agrupados por cada cliente en un periodo de tiempo.',
        link: '/reportes/ingresos-por-cliente',
        icon: <BarChart className="w-6 h-6 text-primary" />,
    },
    {
        title: 'Egresos por Proveedor',
        description: 'Analiza los egresos totales agrupados por cada proveedor.',
        link: '/reportes/egresos-por-proveedor',
        icon: <BarChart className="w-6 h-6 text-primary" />,
    },
    {
        title: 'Estado de Resultados Simplificado',
        description: 'Analiza tus ingresos, egresos y la utilidad neta en un periodo determinado.',
        link: '/reportes/estado-de-resultados',
        icon: <LineChart className="w-6 h-6 text-primary" />,
    },
    {
        title: 'Flujo de Caja',
        description: 'Visualiza entradas (cobranzas) y salidas (pagos) en el tiempo.',
        link: '/reportes/flujo-de-caja',
        icon: <LineChart className="w-6 h-6 text-primary" />,
    },
    {
        title: 'Ranking de Clientes y Proveedores',
        description: 'Visualiza el top 5 de clientes con más ingresos y proveedores con más egresos.',
        link: '/reportes/ranking-clientes-proveedores',
        icon: <BarChart className="w-6 h-6 text-primary" />,
    },
    // Futuros reportes se pueden agregar aquí
];

const Reports = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Módulo de Reportes</h1>
                <p className="text-muted-foreground">Selecciona un reporte para visualizar y analizar tus datos.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                    <Link to={report.link} key={report.title} className="group block">
                        <Card className="h-full transition-all group-hover:border-primary group-hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-semibold">
                                    {report.title}
                                </CardTitle>
                                {report.icon}
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{report.description}</p>
                            </CardContent>
                             <div className="flex items-center p-6 pt-0">
                                <div className="text-sm font-medium text-primary flex items-center">
                                    Ver Reporte
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Reports;
