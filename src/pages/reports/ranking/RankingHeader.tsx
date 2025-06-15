
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

interface RankingHeaderProps {
    onExport: () => void;
}

export const RankingHeader = ({ onExport }: RankingHeaderProps) => {
    return (
        <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>Reporte de Ranking de Clientes y Proveedores</CardTitle>
                    <CardDescription>
                        Visualiza el top 5 de clientes con más ingresos y proveedores con más egresos.
                    </CardDescription>
                </div>
                <Button onClick={onExport} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar a PDF
                </Button>
            </div>
        </CardHeader>
    );
};
