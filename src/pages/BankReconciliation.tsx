
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, PlusCircle, Check, X } from 'lucide-react';
import { BankTransaction } from '@/types/reconciliation';
import { JournalEntry } from '@/types/journal';
import { journalEntries as allJournalEntries } from '@/data/journalEntries';
import { BankTransactionsTable } from '@/components/reconciliation/BankTransactionsTable';
import { JournalEntriesToReconcileTable } from '@/components/reconciliation/JournalEntriesToReconcileTable';
import { useToast } from "@/hooks/use-toast";

const initialBankTransactions: BankTransaction[] = [
    { id: 'bt-1', date: new Date('2025-06-12').toISOString(), description: 'DEPOSITO SPEI CLIENTE A', amount: 15000, type: 'credit', status: 'unreconciled' },
    { id: 'bt-2', date: new Date('2025-06-14').toISOString(), description: 'PAGO TARJETA DE CREDITO', amount: 5000, type: 'debit', status: 'unreconciled' },
    { id: 'bt-3', date: new Date('2025-06-15').toISOString(), description: 'DEPOSITO CLIENTE B', amount: 2500, type: 'credit', status: 'unreconciled' },
];

const BankReconciliation = () => {
    const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(initialBankTransactions);
    const incomeJournalEntries = allJournalEntries.filter(je => je.type === 'Ingreso' && je.status === 'Revisada');
    
    const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
    const [selectedJournalEntry, setSelectedJournalEntry] = useState<JournalEntry | null>(null);

    const { toast } = useToast();

    const reconciledJournalEntryIds = useMemo(() => {
        return bankTransactions
            .filter(t => t.status === 'reconciled' && t.journalEntryId)
            .map(t => t.journalEntryId!);
    }, [bankTransactions]);

    const handleReconcile = () => {
        if (!selectedTransaction || !selectedJournalEntry) {
            toast({ title: "Selección incompleta", description: "Debes seleccionar un movimiento y una póliza.", variant: "destructive" });
            return;
        }

        const journalEntryAmount = selectedJournalEntry.lines.reduce((sum, line) => sum + line.credit, 0);
        const isMatch = selectedTransaction.amount === journalEntryAmount;

        setBankTransactions(prev => prev.map(t => 
            t.id === selectedTransaction.id 
            ? { ...t, status: isMatch ? 'reconciled' : 'mismatch', journalEntryId: isMatch ? selectedJournalEntry.id : undefined } 
            : t
        ));

        toast({
            title: isMatch ? "¡Conciliación Exitosa!" : "Diferencia Encontrada",
            description: isMatch ? `El movimiento se ha conciliado con la póliza ${selectedJournalEntry.number}.` : "El monto del movimiento y la póliza no coinciden.",
            variant: isMatch ? "default" : "destructive",
        });

        setSelectedTransaction(null);
        setSelectedJournalEntry(null);
    }
    
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Conciliación Bancaria</CardTitle>
                        <CardDescription>Compara tus movimientos bancarios con tus pólizas de ingresos.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" disabled>
                            <Upload className="mr-2 h-4 w-4" />
                            Cargar CSV
                        </Button>
                        <Button disabled>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Agregar Manual
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Movimientos Bancarios</h3>
                    <BankTransactionsTable 
                        transactions={bankTransactions}
                        selectedTransaction={selectedTransaction}
                        onSelectTransaction={(t) => setSelectedTransaction(t.status !== 'reconciled' ? t : null)}
                    />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Pólizas de Ingreso por Conciliar</h3>
                    <JournalEntriesToReconcileTable
                        entries={incomeJournalEntries}
                        selectedEntry={selectedJournalEntry}
                        onSelectEntry={setSelectedJournalEntry}
                        reconciledEntryIds={reconciledJournalEntryIds}
                    />
                </div>
            </CardContent>
            {selectedTransaction && selectedJournalEntry && (
                <CardFooter className="border-t p-4 flex justify-end items-center gap-4 bg-muted/40">
                     <p className="text-sm mr-auto">
                        Conciliar mov. <strong>{selectedTransaction.description}</strong> (${selectedTransaction.amount.toFixed(2)}) 
                        con póliza <strong>{selectedJournalEntry.number}</strong> (${selectedJournalEntry.lines.reduce((s,l) => s + l.credit, 0).toFixed(2)})?
                     </p>
                    <Button variant="ghost" onClick={() => {
                        setSelectedTransaction(null);
                        setSelectedJournalEntry(null);
                    }}><X className="h-4 w-4 mr-2" />Cancelar</Button>
                    <Button onClick={handleReconcile}><Check className="h-4 w-4 mr-2" />Confirmar Conciliación</Button>
                </CardFooter>
            )}
        </Card>
    );
}

export default BankReconciliation;
