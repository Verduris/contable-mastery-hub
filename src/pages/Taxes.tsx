
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { FeatureCard, RfcValidator, CfdiValidator } from "./taxes";
import { FileText, Calendar, Bot, FileDown, ShieldQuestion, Database } from 'lucide-react';

const taxFeatures = [
    {
        title: "Contabilidad Electrónica",
        description: "Genera reportes contables (Catálogo, Balanza, Pólizas) en formato XML para el SAT. (Art. 28 CFF)",
        icon: <FileText className="h-6 w-6 text-primary" />,
        status: "coming_soon" as const,
    },
    {
        title: "Agenda y Alertas Fiscales",
        description: "Recibe recordatorios de plazos para declaraciones y pagos de impuestos. (Art. 31, 32 CFF)",
        icon: <Calendar className="h-6 w-6 text-primary" />,
        status: "coming_soon" as const,
    },
    {
        title: "Historial de Declaraciones",
        description: "Mantén un registro organizado de todas tus declaraciones y acuses de pago presentados.",
        icon: <Database className="h-6 w-6 text-primary" />,
        status: "coming_soon" as const,
    },
    {
        title: "Simulador de Fiscalización",
        description: "Detecta posibles inconsistencias entre tus CFDI emitidos/recibidos y tus declaraciones. (Art. 42 CFF)",
        icon: <Bot className="h-6 w-6 text-primary" />,
        status: "coming_soon" as const,
    },
    {
        title: "Exportación de Documentación",
        description: "Exporta reportes y respaldos documentales en formatos PDF y XML para auditorías o trámites.",
        icon: <FileDown className="h-6 w-6 text-primary" />,
        status: "coming_soon" as const,
    }
];


const Taxes = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Módulo de Impuestos</h1>
                <p className="text-muted-foreground">Herramientas para el cumplimiento de tus obligaciones fiscales.</p>
            </div>

            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold">
                        <div className="flex items-center gap-3">
                           <ShieldQuestion className="h-6 w-6 text-primary" />
                           Validadores Fiscales (Art. 27-29 CFF)
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-6 pt-4">
                        <div>
                            <h3 className="font-medium mb-2">Validar RFC</h3>
                            <RfcValidator />
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">Validar Estatus de CFDI</h3>
                            <CfdiValidator />
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            
            <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-4">Panel de Cumplimiento</h2>
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {taxFeatures.map((feature) => (
                        <FeatureCard 
                            key={feature.title}
                            title={feature.title}
                            description={feature.description}
                            icon={feature.icon}
                            status={feature.status}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Taxes;
