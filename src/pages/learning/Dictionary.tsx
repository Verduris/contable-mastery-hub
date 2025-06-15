
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Book, Download } from "lucide-react";

const terms = [
  { term: "IVA (Impuesto al Valor Agregado)", definition: "Es un impuesto que se aplica al consumo de bienes y servicios. La tasa general en México es del 16%. El consumidor final es quien lo paga." },
  { term: "ISR (Impuesto Sobre la Renta)", definition: "Es un impuesto directo que se aplica a los ingresos o ganancias obtenidos por personas físicas y morales." },
  { term: "CFF (Código Fiscal de la Federación)", definition: "Es el conjunto de leyes que establece las reglas y procedimientos para la recaudación de impuestos federales en México." },
  { term: "SAT (Servicio de Administración Tributaria)", definition: "Es el órgano del gobierno mexicano encargado de la recaudación de impuestos y la vigilancia del cumplimiento de las obligaciones fiscales." },
  { term: "RFC (Registro Federal de Contribuyentes)", definition: "Es una clave única que identifica a cada persona física o moral que realiza actividades económicas en México." },
  { term: "e.firma (Firma Electrónica Avanzada o FIEL)", definition: "Es un archivo digital seguro que te identifica al realizar trámites por internet ante el SAT. Equivale a tu firma autógrafa." },
  { term: "CFDI (Comprobante Fiscal Digital por Internet)", definition: "Es el nombre oficial de las facturas electrónicas en México. Es el único medio de comprobación fiscal válido." },
  { term: "Activo", definition: "Son todos los bienes y derechos que posee una empresa. Por ejemplo: dinero en caja, inventario, maquinaria, cuentas por cobrar." },
  { term: "Pasivo", definition: "Son todas las deudas y obligaciones que tiene una empresa. Por ejemplo: préstamos bancarios, impuestos por pagar, deudas a proveedores." },
  { term: "Capital Contable", definition: "Es la diferencia entre el Activo y el Pasivo. Representa la inversión de los dueños en la empresa." },
  { term: "Estado de Resultados", definition: "Es un reporte financiero que muestra los ingresos, costos y gastos de una empresa durante un periodo, para determinar si hubo utilidad o pérdida." },
  { term: "Balance General", definition: "Es un reporte financiero que muestra la situación de la empresa en una fecha específica, detallando sus activos, pasivos y capital contable." },
  { term: "Póliza Contable", definition: "Es un documento donde se registran las operaciones de una empresa (de diario, de ingresos o de egresos). Es la base de la contabilidad." },
  { term: "Depreciación", definition: "Es la disminución del valor de un activo fijo (como un coche o una computadora) por el uso y el paso del tiempo." },
  { term: "Amortización", definition: "Es similar a la depreciación, pero se aplica a activos intangibles (como una patente o una licencia de software)." },
];

const Dictionary = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Book /> Diccionario de Conceptos Clave</h1>
      <p className="text-muted-foreground">
        Consulta rápidamente la definición de los términos más comunes en contabilidad y fiscalidad.
      </p>

      <Button asChild variant="outline">
        <a href="/downloads/diccionario-contable-fiscal.pdf" download>
          <Download />
          Descargar Diccionario en PDF
        </a>
      </Button>

      <Accordion type="single" collapsible className="w-full">
        {terms.map((term) => (
          <AccordionItem value={term.term} key={term.term}>
            <AccordionTrigger className="text-base text-left">{term.term}</AccordionTrigger>
            <AccordionContent>
              <p>{term.definition}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Dictionary;
