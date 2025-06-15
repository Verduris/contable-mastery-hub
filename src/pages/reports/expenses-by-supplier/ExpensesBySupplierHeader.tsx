
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

export const ExpensesBySupplierHeader = () => {
    const { toast } = useToast();

    const handleDownload = () => {
        toast({
            title: "Función en desarrollo",
            description: "La exportación a Excel estará disponible pronto.",
        })
    }

    return (
        <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>Reporte de Egresos por Proveedor</CardTitle>
                    <CardDescription>Analiza los egresos, pagos y saldos pendientes por proveedor.</CardDescription>
                </div>
                <Button onClick={handleDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                </Button>
            </div>
        </CardHeader>
    );
};
