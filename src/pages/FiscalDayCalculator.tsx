
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { addBusinessDays, countBusinessDays } from '@/utils/fiscalDays';
import { cn } from '@/lib/utils';
import { CalendarIcon, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const FiscalDayCalculator = () => {
    // Estado para la calculadora de fecha de vencimiento
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [businessDays, setBusinessDays] = useState<number>(10);
    const [resultDate, setResultDate] = useState<Date | null>(null);

    // Estado para el contador de días hábiles
    const [countStartDate, setCountStartDate] = useState<Date | undefined>(new Date());
    const [countEndDate, setCountEndDate] = useState<Date | undefined>(new Date());
    const [dayCount, setDayCount] = useState<number | null>(null);

    const handleCalculateDueDate = () => {
        if (startDate && businessDays > 0) {
            setResultDate(addBusinessDays(startDate, businessDays));
        }
    };

    const handleCountBusinessDays = () => {
        if (countStartDate && countEndDate && countEndDate >= countStartDate) {
            setDayCount(countBusinessDays(countStartDate, countEndDate));
        } else {
            setDayCount(null);
        }
    };

    const DatePicker = ({ date, setDate }: { date?: Date, setDate: (date?: Date) => void }) => (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Calculadora de Días Hábiles Fiscales</h1>
                <p className="text-muted-foreground">Calcula plazos y cuenta días hábiles conforme al CFF y la LFT.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Calcular Fecha de Vencimiento</CardTitle>
                        <CardDescription>Introduce una fecha de inicio y un número de días hábiles para encontrar la fecha final.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha de Inicio</label>
                            <DatePicker date={startDate} setDate={setStartDate} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Días Hábiles a Añadir</label>
                            <Input
                                type="number"
                                value={businessDays}
                                onChange={(e) => setBusinessDays(parseInt(e.target.value, 10) || 0)}
                                className="w-[280px]"
                                min="1"
                            />
                        </div>
                        <Button onClick={handleCalculateDueDate} disabled={!startDate || !businessDays || businessDays <= 0}>Calcular Fecha</Button>
                        {resultDate && (
                            <div className="pt-4">
                                <p className="text-sm text-muted-foreground">La fecha de vencimiento es:</p>
                                <p className="text-xl font-bold text-primary">{format(resultDate, 'PPPP', { locale: es })}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contar Días Hábiles entre Fechas</CardTitle>
                        <CardDescription>Selecciona un rango de fechas para saber cuántos días hábiles hay entre ellas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha de Inicio</label>
                            <DatePicker date={countStartDate} setDate={setCountStartDate} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha Final</label>
                            <DatePicker date={countEndDate} setDate={setCountEndDate} />
                        </div>
                        <Button onClick={handleCountBusinessDays} disabled={!countStartDate || !countEndDate || (countEndDate && countStartDate && countEndDate < countStartDate)}>Contar Días</Button>
                        {dayCount !== null && (
                            <div className="pt-4">
                                <p className="text-sm text-muted-foreground">Total de días hábiles:</p>
                                <p className="text-xl font-bold text-primary">{dayCount} días</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <HelpCircle className="h-6 w-6 text-primary"/>
                    <CardTitle>¿Qué es un día hábil fiscal?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                   <p>Según el Artículo 12 del Código Fiscal de la Federación (CFF), para los plazos fijados en días, no se contarán los sábados, los domingos ni el 1o. de enero; el primer lunes de febrero; el tercer lunes de marzo; el 1o. de mayo; el 16 de septiembre; el tercer lunes de noviembre; el 1o. de diciembre de cada 6 años, cuando corresponda a la transmisión del Poder Ejecutivo Federal, y el 25 de diciembre.</p>
                   <p>Tampoco se cuentan los días en que tengan vacaciones generales las autoridades fiscales federales, excepto cuando se habiliten para recibir pagos y declaraciones.</p>
                   <p className="font-semibold">Esta calculadora considera los días feriados oficiales de 2025. Los periodos vacacionales del SAT no están incluidos en este cálculo.</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default FiscalDayCalculator;
