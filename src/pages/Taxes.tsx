
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { FeatureCard, RfcValidator, CfdiValidator, FiscalRegimenValidator, ComplianceOpinionValidator } from "./taxes";
import { FileText, Bot, ShieldQuestion, Database, Mailbox, Calculator, ListChecks, BadgePercent } from 'lucide-react';

const taxFeatures = [
    {
        title: "Buzón Tributario (Simulación)",
        description: "Recibe notificaciones y comunicados fiscales simulados del SAT. (Art. 17-K CFF)",
        icon: <Mailbox className="h-6 w-6 text-primary" />,
        status: "coming_soon" as const,
    },
    {
        title: "Calculadora de Días Hábiles Fiscales",
        description: "Calcula plazos de vencimiento considerando días inhábiles oficiales. (Art. 12, 13 CFF)",
        icon: <Calculator className="h-6 w-6 text-primary" />,
        status: "coming_soon" as const,
    },
    {
        title: "Administrador de Obligaciones",
        description: "Visualiza tus obligaciones fiscales recurrentes según tu régimen fiscal.",
        icon: <ListChecks className="h-6 w-6 text-primary" />,
        status: "coming_soon" as const,
    },
    {
        title: "Visor de Declaraciones Presentadas",
        description: "Mantén un registro de tus declaraciones y acuses de pago presentados.",
        icon: <FileText className="h-6 w-6 text-primary" />,
        status: "coming_soon" as const,
    },
    {
        title: "Simulación de Multas y Recargos",
        description: "Estima posibles multas y recargos por cumplimiento extemporáneo. (Art. 76, 82 CFF)",
        icon: <BadgePercent className="h-6 w-6 text-primary" />,
        status: "coming_soon" as const,
    },
    {
        title: "Contabilidad Electrónica",
        description: "Genera reportes contables (Catálogo, Balanza, Pólizas) en formato XML para el SAT. (Art. 28 CFF)",
        icon: <Database className="h-6 w-6 text-primary" />,
        status: "coming_soon" as const,
    },
    {
        title: "Simulador de Fiscalización",
        description: "Detecta posibles inconsistencias entre tus CFDI y tus declaraciones. (Art. 42 CFF)",
        icon: <Bot className="h-6 w-6 text-primary" />,
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
                           Validadores Fiscales
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
                        <div>
                            <h3 className="font-medium mb-2">Consultar Régimen Fiscal</h3>
                            <FiscalRegimenValidator />
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">Verificar Opinión de Cumplimiento (Art. 32-D CFF)</h3>
                            <ComplianceOpinionValidator />
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
