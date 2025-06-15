
import { JournalEntry } from "@/types/journal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface JournalEntriesToReconcileTableProps {
    entries: JournalEntry[];
    selectedEntry: JournalEntry | null;
    onSelectEntry: (entry: JournalEntry) => void;
    reconciledEntryIds: string[];
}

export const JournalEntriesToReconcileTable = ({ entries, selectedEntry, onSelectEntry, reconciledEntryIds }: JournalEntriesToReconcileTableProps) => {

    const getEntryAmount = (entry: JournalEntry): number => {
        // Suma de créditos para pólizas de ingreso
        return entry.lines.reduce((total, line) => total + line.credit, 0);
    }
    
    const availableEntries = entries.filter(e => !reconciledEntryIds.includes(e.id));

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Nº Póliza</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {availableEntries.map(e => (
                        <TableRow 
                            key={e.id}
                            onClick={() => onSelectEntry(e)}
                            className={cn(
                                "cursor-pointer",
                                selectedEntry?.id === e.id && "bg-blue-500/20 hover:bg-blue-500/30"
                            )}
                        >
                            <TableCell>{format(new Date(e.date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                            <TableCell>{e.number}</TableCell>
                            <TableCell>{e.concept}</TableCell>
                            <TableCell className="text-right font-mono">
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(getEntryAmount(e))}
                            </TableCell>
                        </TableRow>
                    ))}
                    {availableEntries.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No hay pólizas de ingreso pendientes.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
