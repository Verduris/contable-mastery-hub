
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";

const CaseStudies = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Casos Prácticos y Plantillas</h1>
            <p className="text-muted-foreground">
                Aplica lo aprendido resolviendo estos escenarios del mundo real.
            </p>

            <Tabs defaultValue="case-payables" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="case-payables">Caso 1: Cuentas por Pagar</TabsTrigger>
                    <TabsTrigger value="case-invoicing">Caso 2: Facturación</TabsTrigger>
                </TabsList>
                <TabsContent value="case-payables">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestión de Pagos a Proveedores</CardTitle>
                            <CardDescription>Una pequeña empresa de diseño necesita organizar sus pagos pendientes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold">Escenario:</h4>
                                <p className="text-sm text-muted-foreground">
                                    "Diseños Creativos S.A. de C.V." tiene tres facturas pendientes de pago:
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>Factura A123 del proveedor "Papelería del Centro" por $1,500 MXN (material de oficina), vence en 5 días.</li>
                                        <li>Factura B456 del proveedor "Software Rápido" por $3,000 MXN (licencia de software), venció hace 10 días.</li>
                                        <li>Factura C789 del proveedor "Imprenta Veloz" por $5,200 MXN (impresión de folletos), vence en 20 días.</li>
                                    </ul>
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold">Tu Tarea:</h4>
                                <p className="text-sm text-muted-foreground">
                                    Utilizando la plantilla de Excel, registra estas facturas, prioriza el pago de la factura vencida y programa los pagos futuros para mantener una buena relación con los proveedores.
                                </p>
                            </div>
                             <Button asChild>
                                <a href="/downloads/plantilla-cuentas-por-pagar.xlsx" download>
                                    <Download />
                                    Descargar Plantilla (Excel)
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="case-invoicing">
                     <Card>
                        <CardHeader>
                            <CardTitle>Emisión de Factura con Retenciones</CardTitle>
                            <CardDescription>Un profesionista independiente necesita facturar sus servicios a una empresa.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold">Escenario:</h4>
                                <p className="text-sm text-muted-foreground">
                                    Ana, una diseñadora gráfica que trabaja por honorarios (Servicios Profesionales), realizó un proyecto de branding para la empresa "Constructora El Fuerte S.A. de C.V." (persona moral). El costo total del servicio es de $20,000 MXN más IVA.
                                </p>
                            </div>
                             <div className="space-y-2">
                                <h4 className="font-semibold">Tu Tarea:</h4>
                                <p className="text-sm text-muted-foreground">
                                    Usando la plantilla de Word, elabora un borrador de la factura que Ana debe emitir. Debes calcular correctamente el IVA trasladado (16%) y las retenciones aplicables: retención de ISR (10%) y retención de IVA (dos terceras partes del IVA).
                                </p>
                            </div>
                            <Button asChild>
                                <a href="/downloads/plantilla-facturacion-honorarios.docx" download>
                                    <Download />
                                    Descargar Plantilla (Word)
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default CaseStudies;
