
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar as CalendarIcon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Account } from "@/types/account";
import { Client } from "@/types/client";
import { JournalEntryFormData, JournalEntryStatus } from "@/types/journal";
import { useMemo, useEffect } from "react";
import { JournalEntryLinesTable } from "./journal-entry-form/JournalEntryLinesTable";

const formSchema = z.object({
    number: z.string().min(1, "El número de póliza es requerido."),
    date: z.date({ required_error: "La fecha es requerida." }),
    concept: z.string().min(1, "El concepto es requerido."),
    type: z.enum(["Ingreso", "Egreso", "Diario"]),
    status: z.enum(["Borrador", "Revisada", "Anulada"]),
    reference: z.string().optional(),
    clientId: z.string().optional(),
    lines: z.array(z.object({
        accountId: z.string().min(1, "Debes seleccionar una cuenta."),
        description: z.string().min(1, "La descripción es requerida."),
        debit: z.coerce.number().min(0),
        credit: z.coerce.number().min(0),
    })).min(2, "La póliza debe tener al menos dos movimientos.")
    .refine(lines => lines.every(line => line.debit > 0 || line.credit > 0), {
        message: "Cada movimiento debe tener un monto en Debe o Haber.",
    })
});

type JournalEntryFormProps = {
  accounts: Account[];
  clients: Client[];
  onSave: (data: JournalEntryFormData) => void;
  onCancel: () => void;
  nextEntryNumber: string;
};

export const JournalEntryForm = ({ accounts, clients, onSave, onCancel, nextEntryNumber }: JournalEntryFormProps) => {
  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: nextEntryNumber,
      date: new Date(),
      type: "Diario",
      status: "Borrador" as JournalEntryStatus,
      concept: "",
      reference: "",
      clientId: "",
      lines: [
        { accountId: "", description: "", debit: 0, credit: 0 },
        { accountId: "", description: "", debit: 0, credit: 0 },
      ],
    },
  });

  const watchedLines = form.watch("lines");
  const watchedType = form.watch("type");

  useEffect(() => {
    if (watchedType === 'Diario') {
      form.setValue('clientId', undefined);
    }
  }, [watchedType, form]);

  const totals = useMemo(() => {
    return watchedLines.reduce((acc, line) => {
        acc.debit += line.debit || 0;
        acc.credit += line.credit || 0;
        return acc;
    }, { debit: 0, credit: 0 });
  }, [watchedLines]);

  const isBalanced = useMemo(() => totals.debit === totals.credit, [totals]);
  const hasAmounts = useMemo(() => totals.debit > 0 || totals.credit > 0, [totals]);

  function onSubmit(values: JournalEntryFormData) {
    const dataToSave = { ...values };
    if (dataToSave.type === 'Diario') {
        delete dataToSave.clientId;
    }
    onSave(dataToSave);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            <FormField control={form.control} name="number" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nº Póliza</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Ingreso">Ingreso</SelectItem>
                            <SelectItem value="Egreso">Egreso</SelectItem>
                            <SelectItem value="Diario">Diario</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, 'PPP', { locale: es }) : <span>Elige una fecha</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                    <FormLabel>Estatus</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Borrador">Borrador</SelectItem>
                            <SelectItem value="Revisada">Revisada</SelectItem>
                            <SelectItem value="Anulada">Anulada</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="reference" render={({ field }) => (
                <FormItem>
                    <FormLabel>Referencia <span className="text-muted-foreground">(Opcional)</span></FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField 
            control={form.control} 
            name="concept" 
            render={({ field }) => (
              <FormItem className={cn(!(watchedType === 'Ingreso' || watchedType === 'Egreso') && "md:col-span-2")}>
                  <FormLabel>Concepto General</FormLabel>
                  <FormControl><Input placeholder="Ej. Pago de nómina quincenal" {...field} /></FormControl>
                  <FormMessage />
              </FormItem>
            )} 
          />
          
          {(watchedType === 'Ingreso' || watchedType === 'Egreso') && (
              <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Cliente</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                              <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Selecciona un cliente" />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="">Ninguno</SelectItem>
                                  {clients.map(client => (
                                      <SelectItem key={client.id} value={client.id}>
                                          {client.name}
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )}
              />
          )}
        </div>

        <JournalEntryLinesTable accounts={accounts} />
        
        <div className="mt-4 -mb-2">
            {hasAmounts && (
                 <Alert variant={isBalanced ? "default" : "destructive"} className={cn(
                    isBalanced && "border-green-500 text-green-700 dark:border-green-600 dark:text-green-500 [&>svg]:text-green-700 dark:[&>svg]:text-green-500"
                )}>
                    {isBalanced ? <CheckCircle2 /> : <AlertTriangle />}
                    <AlertTitle>{isBalanced ? "¡Póliza Cuadrada!" : "Saldos no coinciden"}</AlertTitle>
                    <AlertDescription>
                        {isBalanced
                            ? "✅ La póliza cuadra correctamente."
                            : "⚠️ La suma del Debe y el Haber no coincide. Verifica tus movimientos."}
                    </AlertDescription>
                </Alert>
            )}
        </div>
        
        {form.formState.errors.lines && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.lines.message}</p>}
        
        <div className="flex justify-end items-center gap-4 pt-4 border-t">
            <div className={cn("text-lg font-semibold", totals.debit !== totals.credit && "text-destructive")}>
                Totales:
            </div>
            <div className="w-1/5">
                <Input readOnly value={totals.debit.toFixed(2)} className="text-right font-semibold border-none" />
            </div>
            <div className="w-1/5">
                <Input readOnly value={totals.credit.toFixed(2)} className="text-right font-semibold border-none" />
            </div>
            <div className="w-auto px-4"></div>
        </div>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={!isBalanced || !hasAmounts}>Guardar Póliza</Button>
        </div>
      </form>
    </Form>
  );
};
