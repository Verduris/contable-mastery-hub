
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Bot } from "lucide-react";

const exercises = [
    {
        title: "Registro de Factura de Venta",
        description: "Simula la creación de una factura para un cliente, incluyendo datos fiscales, productos, IVA y retenciones.",
    },
    {
        title: "Validación de RFC y Razón Social",
        description: "Utiliza un listado de RFCs para verificar su validez y estructura. Este ejercicio te ayuda a entender la importancia de los datos correctos.",
    },
    {
        title: "Cálculo de Impuestos Mensual (Simplificado)",
        description: "A partir de un listado de ingresos y gastos, calcula el IVA a pagar y el ISR provisional de un mes.",
    },
    {
        title: "Clasificación de Cuentas Contables",
        description: "Clasifica una serie de operaciones (compra de material, pago de nómina, venta de servicio) en las cuentas contables correspondientes (activo, pasivo, capital, ingreso, costo, gasto).",
    }
]

const Simulators = () => {
    return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Bot /> Simuladores Educativos</h1>
      <p className="text-muted-foreground">
        ¡La práctica hace al maestro! Realiza estos ejercicios para afianzar tus conocimientos contables y fiscales.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        {exercises.map((exercise) => (
            <Card key={exercise.title}>
                <CardHeader>
                    <CardTitle>{exercise.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">{exercise.description}</p>
                </CardContent>
            </Card>
        ))}
      </div>
      
       <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            Descarga los Ejercicios
          </CardTitle>
          <CardDescription>
            Obtén el archivo de Excel con todos los datos y plantillas necesarias para completar los simulacros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/downloads/ejercicios-simulacion-contable.xlsx" download>
              <Download />
              Descargar Archivo Excel
            </a>
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}

export default Simulators;
