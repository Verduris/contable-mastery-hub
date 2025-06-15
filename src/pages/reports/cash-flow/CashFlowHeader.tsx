
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

interface CashFlowHeaderProps {
    onExport: () => void;
}

export const CashFlowHeader = ({ onExport }: CashFlowHeaderProps) => {
    return (
        <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>Reporte de Flujo de Caja</CardTitle>
                    <CardDescription>Visualiza las entradas y salidas de dinero en un periodo determinado.</CardDescription>
                </div>
                <Button onClick={onExport} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar a PDF
                </Button>
            </div>
        </CardHeader>
    );
};
