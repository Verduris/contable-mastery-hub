
import { useForm, useFieldArray } from "react-hook-form";
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
import { Calendar as CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Account } from "@/types/account";
import { JournalEntryFormData, JournalEntryType } from "@/types/journal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo } from "react";

const formSchema = z.object({
    number: z.string().min(1, "El número de póliza es requerido."),
    date: z.date({ required_error: "La fecha es requerida." }),
    concept: z.string().min(1, "El concepto es requerido."),
    type: z.enum(["Ingreso", "Egreso", "Diario"]),
    reference: z.string().optional(),
    lines: z.array(z.object({
        accountId: z.string().min(1, "Debes seleccionar una cuenta."),
        description: z.string().min(1, "La descripción es requerida."),
        debit: z.coerce.number().min(0),
        credit: z.coerce.number().min(0),
    })).min(2, "La póliza debe tener al menos dos movimientos.")
    .refine(lines => lines.every(line => line.debit > 0 || line.credit > 0), {
        message: "Cada movimiento debe tener un monto en Debe o Haber.",
    })
}).refine(data => {
    const totalDebit = data.lines.reduce((acc, line) => acc + line.debit, 0);
    const totalCredit = data.lines.reduce((acc, line) => acc + line.credit, 0);
    return totalDebit === totalCredit;
}, {
    message: "La suma del Debe y el Haber no coincide.",
    path: ["lines"],
});

type JournalEntryFormProps = {
  accounts: Account[];
  onSave: (data: JournalEntryFormData) => void;
  onCancel: () => void;
  nextEntryNumber: string;
};

export const JournalEntryForm = ({ accounts, onSave, onCancel, nextEntryNumber }: JournalEntryFormProps) => {
  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: nextEntryNumber,
      date: new Date(),
      type: "Diario",
      concept: "",
      reference: "",
      lines: [
        { accountId: "", description: "", debit: 0, credit: 0 },
        { accountId: "", description: "", debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "lines",
  });
  
  const watchedLines = form.watch("lines");
  const totals = useMemo(() => {
    return watchedLines.reduce((acc, line) => {
        acc.debit += line.debit || 0;
        acc.credit += line.credit || 0;
        return acc;
    }, { debit: 0, credit: 0 });
  }, [watchedLines]);

  function onSubmit(values: JournalEntryFormData) {
    onSave(values);
  }

  const handleAmountChange = (index: number, field: 'debit' | 'credit', value: number) => {
    const otherField = field === 'debit' ? 'credit' : 'debit';
    const currentLine = form.getValues(`lines.${index}`);
    if (value > 0) {
      update(index, { ...currentLine, [field]: value, [otherField]: 0 });
    } else {
      update(index, { ...currentLine, [field]: value });
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <FormItem className="flex flex-col pt-2">
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
            <FormField control={form.control} name="reference" render={({ field }) => (
                <FormItem>
                    <FormLabel>Referencia <span className="text-muted-foreground">(Opcional)</span></FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>

        <FormField control={form.control} name="concept" render={({ field }) => (
            <FormItem>
                <FormLabel>Concepto General</FormLabel>
                <FormControl><Input placeholder="Ej. Pago de nómina quincenal" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />

        <div>
            <h3 className="text-lg font-medium mb-2">Movimientos Contables</h3>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-2/5">Cuenta</TableHead>
                            <TableHead className="w-2/5">Descripción</TableHead>
                            <TableHead className="w-1/5 text-right">Debe</TableHead>
                            <TableHead className="w-1/5 text-right">Haber</TableHead>
                            <TableHead className="w-auto"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                       {fields.map((field, index) => (
                         <TableRow key={field.id}>
                            <TableCell>
                                <FormField control={form.control} name={`lines.${index}.accountId`} render={({ field }) => (
                                    <FormItem>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccione..."/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.code} - {acc.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}/>
                            </TableCell>
                            <TableCell>
                                <FormField control={form.control} name={`lines.${index}.description`} render={({ field }) => (
                                    <FormItem><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                                )}/>
                            </TableCell>
                            <TableCell>
                                <FormField control={form.control} name={`lines.${index}.debit`} render={({ field }) => (
                                     <FormItem><FormControl><Input type="number" {...field} className="text-right" onChange={e => handleAmountChange(index, 'debit', +e.target.value)} /></FormControl><FormMessage/></FormItem>
                                )}/>
                            </TableCell>
                            <TableCell>
                                <FormField control={form.control} name={`lines.${index}.credit`} render={({ field }) => (
                                     <FormItem><FormControl><Input type="number" {...field} className="text-right" onChange={e => handleAmountChange(index, 'credit', +e.target.value)}/></FormControl><FormMessage/></FormItem>
                                )}/>
                            </TableCell>
                             <TableCell>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                             </TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                </Table>
            </div>
             <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ accountId: "", description: "", debit: 0, credit: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Movimiento
            </Button>
            {form.formState.errors.lines && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.lines.message || form.formState.errors.lines.root?.message}</p>}
        </div>
        
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
            <div className="w-auto"></div>
        </div>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={totals.debit !== totals.credit || totals.debit === 0}>Guardar Póliza</Button>
        </div>
      </form>
    </Form>
  );
};
