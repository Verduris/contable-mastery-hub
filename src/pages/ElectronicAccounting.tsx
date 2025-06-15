
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Database, BarChart2, BookOpen } from "lucide-react";
import { useGenerateCatalogXml } from "@/hooks/e-accounting/useGenerateCatalogXml";

const ElectronicAccounting = () => {
    const { generateXml: generateCatalog, isLoading: isLoadingCatalog } = useGenerateCatalogXml();

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Contabilidad Electrónica</h1>
                <p className="text-muted-foreground">Genera los archivos XML para el SAT conforme al Anexo 24.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Database className="h-8 w-8 text-primary"/>
                            <div>
                                <CardTitle>Catálogo de Cuentas</CardTitle>
                                <CardDescription>Genera el XML con tu catálogo de cuentas contables.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={generateCatalog} disabled={isLoadingCatalog}>
                            <Download className="mr-2 h-4 w-4" />
                            {isLoadingCatalog ? 'Generando...' : 'Generar y Descargar XML'}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">Basado en el Art. 28, Fracción IV del CFF.</p>
                    </CardContent>
                </Card>

                <Card className="opacity-50 cursor-not-allowed">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <BarChart2 className="h-8 w-8 text-muted-foreground"/>
                             <div>
                                <CardTitle>Balanza de Comprobación</CardTitle>
                                <CardDescription>Genera la balanza de comprobación de un periodo específico.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Button disabled>
                            <Download className="mr-2 h-4 w-4" />
                            Próximamente
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">Envío mensual requerido por el SAT.</p>
                    </CardContent>
                </Card>

                <Card className="opacity-50 cursor-not-allowed">
                    <CardHeader>
                         <div className="flex items-center gap-4">
                            <BookOpen className="h-8 w-8 text-muted-foreground"/>
                             <div>
                                <CardTitle>Pólizas del Periodo</CardTitle>
                                <CardDescription>Genera las pólizas contables de un periodo.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button disabled>
                            <Download className="mr-2 h-4 w-4" />
                            Próximamente
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">A solicitud de la autoridad fiscal.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ElectronicAccounting;
