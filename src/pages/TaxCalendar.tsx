
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { taxEvents, TaxEventStatus } from '@/data/taxEvents';
import { parseISO, isSameDay } from 'date-fns';
import { CalendarDays, FileText } from 'lucide-react';

const modifierStyles = {
  presentado: {
    color: '#166534', // text-green-800
    backgroundColor: '#dcfce7', // bg-green-100
  },
  pendiente: {
    color: '#a16207', // text-yellow-700
    backgroundColor: '#fef9c3', // bg-yellow-100
  },
  vencido: {
    color: '#991b1b', // text-red-800
    backgroundColor: '#fee2e2', // bg-red-100
  },
};

const TaxCalendar = () => {
    const [date, setDate] = useState<Date | undefined>(new Date('2025-06-17'));

    const eventsByStatus = taxEvents.reduce((acc, event) => {
        const key = event.status.toLowerCase() as keyof typeof modifierStyles;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(parseISO(event.date));
        return acc;
    }, {} as Record<keyof typeof modifierStyles, Date[]>);

    const selectedDayEvents = date
        ? taxEvents.filter((event) => isSameDay(parseISO(event.date), date))
        : [];
    
    const getBadgeVariant = (status: TaxEventStatus): 'success' | 'warning' | 'destructive' => {
        switch (status) {
            case 'Presentado': return 'success';
            case 'Pendiente': return 'warning';
            case 'Vencido': return 'destructive';
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Agenda Fiscal</h1>
                <p className="text-muted-foreground">Controla tus fechas clave de cumplimiento fiscal.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <Card>
                        <CardContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="p-4 w-full"
                                month={new Date('2025-06-15')}
                                modifiers={{ 
                                    presentado: eventsByStatus.presentado || [], 
                                    pendiente: eventsByStatus.pendiente || [],
                                    vencido: eventsByStatus.vencido || []
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
                            {selectedDayEvents.map((event) => (
                                <Card key={event.id} className="overflow-hidden">
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-base leading-tight">{event.title}</CardTitle>
                                            <Badge variant={getBadgeVariant(event.status)} className="flex-shrink-0">{event.status}</Badge>
                                        </div>
                                        <CardDescription>{event.taxType} - {event.regime}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                                        <div className="mt-2 pt-2 border-t">
                                            <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 pt-2">
                                                <FileText className="h-3 w-3" />
                                                Base Legal: {event.legalBasis}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full bg-muted/20">
                            <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
                            <p className="mt-4 text-sm font-medium text-muted-foreground">
                                No hay obligaciones para este día.
                            </p>
                            <p className="text-xs text-muted-foreground">Selecciona una fecha coloreada en el calendario.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaxCalendar;
