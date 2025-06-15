
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

interface AgingHeaderProps {
    onExport: () => void;
}

export const AgingHeader = ({ onExport }: AgingHeaderProps) => {
    return (
        <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>Reporte de Vencimientos</CardTitle>
                    <CardDescription>
                        Cuentas por cobrar y pagar próximas a vencer o vencidas.
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
