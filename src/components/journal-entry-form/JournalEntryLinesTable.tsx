
import { useFieldArray, useFormContext } from "react-hook-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AccountCombobox } from "./AccountCombobox";
import { Account } from "@/types/account";
import { JournalEntryFormData } from "@/types/journal";

type JournalEntryLinesTableProps = {
    accounts: Account[];
};

export const JournalEntryLinesTable = ({ accounts }: JournalEntryLinesTableProps) => {
    const { control, setValue } = useFormContext<JournalEntryFormData>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "lines",
    });

    const handleAmountChange = (index: number, field: 'debit' | 'credit', value: number) => {
        const otherField = field === 'debit' ? 'credit' : 'debit';
        if (value > 0) {
            setValue(`lines.${index}.${field}`, value, { shouldValidate: true });
            setValue(`lines.${index}.${otherField}`, 0, { shouldValidate: true });
        } else {
            setValue(`lines.${index}.${field}`, value, { shouldValidate: true });
        }
    };

    return (
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
                                    <FormField
                                        control={control}
                                        name={`lines.${index}.accountId`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <AccountCombobox
                                                    accounts={accounts}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormField control={control} name={`lines.${index}.description`} render={({ field }) => (
                                        <FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </TableCell>
                                <TableCell>
                                    <FormField control={control} name={`lines.${index}.debit`} render={({ field }) => (
                                        <FormItem><FormControl><Input type="number" {...field} className="text-right" onChange={e => handleAmountChange(index, 'debit', +e.target.value)} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </TableCell>
                                <TableCell>
                                    <FormField control={control} name={`lines.${index}.credit`} render={({ field }) => (
                                        <FormItem><FormControl><Input type="number" {...field} className="text-right" onChange={e => handleAmountChange(index, 'credit', +e.target.value)}/></FormControl><FormMessage /></FormItem>
                                    )} />
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
        </div>
    );
};
