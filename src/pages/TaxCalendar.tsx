
import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { taxEvents as initialTaxEvents, TaxEvent, TaxEventStatus } from '@/data/taxEvents';
import { parseISO, isSameDay, isBefore, differenceInDays, startOfToday } from 'date-fns';
import { CalendarDays, FileText, CheckCircle2, XCircle, Clock, AlertTriangle, Plus, Link as LinkIcon, Filter, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';
import { AddTaxEventDialog } from '@/components/AddTaxEventDialog';

const statusConfig: Record<TaxEventStatus, {
    label: string;
    icon: React.ElementType;
    badgeVariant: 'success' | 'warning' | 'destructive';
    color: string;
    bgColor: string;
}> = {
    'Presentado': { label: 'Presentado', icon: CheckCircle2, badgeVariant: 'success', color: '#166534', bgColor: '#dcfce7' },
    'Vencido': { label: 'Vencido', icon: XCircle, badgeVariant: 'destructive', color: '#991b1b', bgColor: '#fee2e2' },
    'Pendiente': { label: 'Pendiente', icon: Clock, badgeVariant: 'warning', color: '#a16207', bgColor: '#fef9c3' },
};

const dueSoonConfig = {
    label: 'Por Vencer',
    icon: AlertTriangle,
    badgeVariant: 'warning' as const,
    color: '#b45309', // text-amber-600
    bgColor: '#fef3c7' // bg-amber-100
};

const TaxCalendar = () => {
    const [events, setEvents] = useState<TaxEvent[]>(initialTaxEvents);
    const [date, setDate] = useState<Date | undefined>(new Date('2025-06-17'));
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const taxTypes = useMemo(() => [...new Set(initialTaxEvents.map(e => e.taxType).filter(t => t !== 'Personalizado'))], []);

    const toggleFilter = (taxType: string) => {
        setActiveFilters(prev => {
            const newFilters = new Set(prev);
            if (newFilters.has(taxType)) {
                newFilters.delete(taxType);
            } else {
                newFilters.add(taxType);
            }
            return newFilters;
        });
    };

    const filteredEvents = useMemo(() => {
        if (activeFilters.size === 0) return events;
        return events.filter(event => activeFilters.has(event.taxType));
    }, [events, activeFilters]);

    const getEventComputedStatus = (event: TaxEvent) => {
        const today = startOfToday();
        const eventDate = parseISO(event.date);

        if (event.status === 'Pendiente') {
            if (isBefore(eventDate, today)) {
                // Return as 'Vencido' if pending and past due
                return { ...statusConfig['Vencido'], originalStatus: 'Vencido' as TaxEventStatus };
            }
            const daysUntilDue = differenceInDays(eventDate, today);
            if (daysUntilDue >= 0 && daysUntilDue <= 7) {
                return { ...dueSoonConfig, originalStatus: 'Pendiente' as TaxEventStatus };
            }
        }
        return { ...statusConfig[event.status], originalStatus: event.status };
    };
    
    const eventsByStatus = useMemo(() => {
        return filteredEvents.reduce((acc, event) => {
            const computedStatus = getEventComputedStatus(event);
            const eventDate = parseISO(event.date);
            let key: 'presentado' | 'pendiente' | 'vencido' | 'dueSoon';

            if (computedStatus.label === 'Por Vencer') {
                key = 'dueSoon';
            } else {
                key = computedStatus.originalStatus.toLowerCase() as 'presentado' | 'pendiente' | 'vencido';
            }
            
            if (!acc[key]) {
                acc[key] = [];
            }
            // Ensure no duplicate dates in modifiers
            if (!acc[key].find(d => isSameDay(d, eventDate))) {
                acc[key].push(eventDate);
            }

            return acc;
        }, {} as Record<string, Date[]>);
    }, [filteredEvents]);

    const modifierStyles = {
        presentado: { backgroundColor: statusConfig.Presentado.bgColor, color: statusConfig.Presentado.color, borderRadius: '50%' },
        pendiente: { backgroundColor: statusConfig.Pendiente.bgColor, color: statusConfig.Pendiente.color, borderRadius: '50%' },
        vencido: { backgroundColor: statusConfig.Vencido.bgColor, color: statusConfig.Vencido.color, borderRadius: '50%' },
        dueSoon: { backgroundColor: dueSoonConfig.bgColor, color: dueSoonConfig.color, fontWeight: 'bold', borderRadius: '50%' }
    };
    
    const selectedDayEvents = date
        ? filteredEvents.filter((event) => isSameDay(parseISO(event.date), date))
        : [];
        
    const handleMarkAsPresented = (eventId: string) => {
        setEvents(currentEvents => currentEvents.map(e => e.id === eventId ? { ...e, status: 'Presentado' } : e));
        toast({
            title: "Obligación actualizada",
            description: "La obligación se ha marcado como 'Presentado'.",
        });
    };

    const handleAddEvent = (newEventData: Omit<TaxEvent, 'id' | 'status' | 'regime' | 'legalBasis'>) => {
        const newEvent: TaxEvent = {
            ...newEventData,
            id: String(Date.now()),
            status: 'Pendiente',
            regime: 'General',
            legalBasis: 'N/A',
        };
        setEvents(currentEvents => [...currentEvents, newEvent]);
    };
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agenda Fiscal</h1>
                    <p className="text-muted-foreground">Tu centro de control para el cumplimiento fiscal.</p>
                </div>
                <AddTaxEventDialog onEventAdd={handleAddEvent}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir Evento
                    </Button>
                </AddTaxEventDialog>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {taxTypes.map(type => (
                        <Button
                            key={type}
                            variant={activeFilters.has(type) ? 'default' : 'outline'}
                            onClick={() => toggleFilter(type)}
                            size="sm"
                        >
                            {type}
                        </Button>
                    ))}
                    {activeFilters.size > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setActiveFilters(new Set())}>
                            Limpiar filtros
                        </Button>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <Card>
                        <CardContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="p-4 w-full"
                                month={date || new Date('2025-06-15')}
                                modifiers={{ 
                                    presentado: eventsByStatus.presentado || [], 
                                    pendiente: eventsByStatus.pendiente || [],
                                    vencido: eventsByStatus.vencido || [],
                                    dueSoon: eventsByStatus.dueSoon || []
                                }}
                                modifiersStyles={modifierStyles}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-primary" />
                        Obligaciones para {date ? date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' }) : 'el día'}
                    </h2>
                    {selectedDayEvents.length > 0 ? (
                        <div className="space-y-4">
                            {selectedDayEvents.map((event) => {
                                const status = getEventComputedStatus(event);
                                const StatusIcon = status.icon;

                                return (
                                <Card key={event.id} className="overflow-hidden bg-background">
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-base leading-tight flex items-center gap-2">
                                                <StatusIcon className={`h-5 w-5 flex-shrink-0 ${status.label === 'Por Vencer' ? 'text-amber-600' : status.badgeVariant === 'success' ? 'text-green-600' : status.badgeVariant === 'destructive' ? 'text-red-600' : 'text-yellow-600'}`} />
                                                <span>{event.title}</span>
                                            </CardTitle>
                                            <Badge variant={status.badgeVariant} className="flex-shrink-0">{status.label}</Badge>
                                        </div>
                                        <CardDescription>{event.taxType} - {event.regime}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                        {(status.originalStatus === 'Pendiente' || status.originalStatus === 'Vencido' ) && (
                                            <Button size="sm" onClick={() => handleMarkAsPresented(event.id)}>
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Marcar como Presentado
                                            </Button>
                                        )}
                                        {event.link && (
                                            <Button size="sm" variant="outline" asChild>
                                                <Link to={event.link}>
                                                    <LinkIcon className="mr-2 h-4 w-4" />
                                                    Ir al módulo
                                                </Link>
                                            </Button>
                                        )}
                                        </div>

                                        {event.legalBasis !== 'N/A' && 
                                            <div className="mt-4 pt-3 border-t">
                                                <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 pt-2">
                                                    <FileText className="h-3 w-3" />
                                                    Base Legal: {event.legalBasis}
                                                </p>
                                            </div>
                                        }
                                    </CardContent>
                                </Card>
                            )})}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full bg-muted/50">
                            <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
                            <p className="mt-4 text-sm font-medium text-muted-foreground">
                                No hay obligaciones para este día.
                            </p>
                            <p className="text-xs text-muted-foreground">Selecciona otra fecha o ajusta los filtros.</p>
                        </div>
                    )}
                </div>
            </div>
             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 flex items-start gap-3">
                <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold mb-1">Funciones avanzadas</h3>
                    <p className="text-sm ">
                        Para **recordatorios automáticos por email** y **subir acuses de pago**, necesitas un backend. Activa la integración con **Supabase** en tu proyecto para habilitar estas y otras potentes capacidades.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TaxCalendar;
