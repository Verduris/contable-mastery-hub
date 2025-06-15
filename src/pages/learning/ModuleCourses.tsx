
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Download, Youtube } from "lucide-react";

const modules = [
  {
    title: "Módulo de Clientes",
    videoId: "_xI-nL772IU",
    summary: "Aprende a gestionar tu cartera de clientes de forma eficiente. Este video cubre el alta, baja y modificación de clientes, así como la segmentación y el seguimiento de interacciones para mejorar la relación comercial.",
    resource: {
      name: "Guía Rápida de Clientes.pdf",
      path: "/downloads/guia-clientes.pdf",
    },
  },
  {
    title: "Módulo de Cuentas por Cobrar",
    videoId: "5j5qVzXzZzQ",
    summary: "Descubre cómo administrar eficazmente las cuentas por cobrar para asegurar la liquidez de tu negocio. Se explica el registro de facturas, seguimiento de pagos y gestión de la morosidad.",
    resource: {
      name: "Checklist Cuentas por Cobrar.pdf",
      path: "/downloads/checklist-cxc.pdf",
    },
  },
  {
    title: "Módulo de Cuentas por Pagar",
    videoId: "rF_yO4v-q5c",
    summary: "Mantén una buena relación con tus proveedores gestionando correctamente los pagos. El video aborda el registro de facturas de proveedores, la programación de pagos y el control de vencimientos.",
    resource: {
      name: "Plantilla de Control de Pagos.xlsx",
      path: "/downloads/plantilla-cxp.xlsx",
    },
  },
  {
    title: "Módulo de Facturación",
    videoId: "A-OW2MEr6-M",
    summary: "Domina el proceso de facturación electrónica CFDI 4.0. Este tutorial completo te guía paso a paso en la emisión, cancelación y validación de facturas, cumpliendo con todos los requisitos del SAT.",
    resource: {
      name: "Resumen Visual CFDI 4.0.pdf",
      path: "/downloads/resumen-cfdi40.pdf",
    },
  },
  {
    title: "Módulo de Reportes",
    videoId: "v4x8Lq1J_OA",
    summary: "Los reportes contables son clave para tomar decisiones. Conoce los reportes más importantes (Balance General, Estado de Resultados) y aprende a interpretarlos para entender la salud financiera de tu empresa.",
    resource: {
      name: "Guía de Interpretación de Reportes.pdf",
      path: "/downloads/guia-reportes.pdf",
    },
  },
  {
    title: "Módulo de Impuestos",
    videoId: "I0XpB_xM_hU",
    summary: "Una introducción clara a los principales impuestos en México (ISR, IVA). El video explica qué son, quiénes deben pagarlos y cómo se calculan de forma básica, ideal para principiantes.",
    resource: {
      name: "Calculadora Simplificada de Impuestos.xlsx",
      path: "/downloads/calculadora-impuestos.xlsx",
    },
  },
  {
    title: "Módulo de Agenda Fiscal",
    videoId: "3kXgE5C7wAs",
    summary: "Nunca más olvides una fecha de pago de impuestos. Aprende a usar el calendario fiscal para organizar tus obligaciones, programar declaraciones y evitar multas y recargos del SAT.",
    resource: {
      name: "Calendario de Obligaciones Fiscales.pdf",
      path: "/downloads/calendario-fiscal.pdf",
    },
  },
];

const ModuleCourses = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Rutas de Aprendizaje por Módulo</h1>
      <p className="text-muted-foreground">
        Selecciona un módulo para ver el video tutorial, leer un resumen y descargar material de apoyo.
      </p>
      <Accordion type="single" collapsible className="w-full">
        {modules.map((module) => (
          <AccordionItem value={module.title} key={module.title}>
            <AccordionTrigger className="text-lg">{module.title}</AccordionTrigger>
            <AccordionContent className="space-y-4 p-1">
              <p className="text-muted-foreground">{module.summary}</p>
              <div className="aspect-video">
                <iframe
                  className="w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${module.videoId}`}
                  title={`Video de ${module.title}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <Button asChild>
                  <a href={module.resource.path} download>
                    <Download />
                    Descargar {module.resource.name}
                  </a>
                </Button>
                <Button variant="ghost" asChild>
                  <a href={`https://www.youtube.com/watch?v=${module.videoId}`} target="_blank" rel="noopener noreferrer">
                    <Youtube />
                    Ver en YouTube
                  </a>
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ModuleCourses;
