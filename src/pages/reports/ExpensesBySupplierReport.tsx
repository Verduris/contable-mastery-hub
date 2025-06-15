
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { DateRange } from 'react-day-picker';
import type { JournalEntryStatus } from '@/types/journal';
import { useExpensesBySupplier } from '@/hooks/reports/useExpensesBySupplier';
import {
    ExpensesBySupplierHeader,
    ExpensesBySupplierFilters,
    ExpensesBySupplierChart,
    ExpensesBySupplierTable
} from './expenses-by-supplier';


const ExpensesBySupplierReport = () => {
    const [date, setDate] = useState<DateRange | undefined>();
    const [selectedSupplier, setSelectedSupplier] = useState<string>('todos');
    const [selectedStatus, setSelectedStatus] = useState<JournalEntryStatus | 'todos'>('todos');

    const { filteredData, suppliers, journalStatusOptions } = useExpensesBySupplier({
        date,
        selectedSupplier,
        selectedStatus
    });
    
    const clearFilters = () => {
        setDate(undefined);
        setSelectedSupplier('todos');
        setSelectedStatus('todos');
    };

    return (
        <div className="space-y-6">
            <Card>
                <ExpensesBySupplierHeader />
                <CardContent className="space-y-6">
                    <ExpensesBySupplierFilters
                        date={date}
                        setDate={setDate}
                        selectedSupplier={selectedSupplier}
                        setSelectedSupplier={setSelectedSupplier}
                        selectedStatus={selectedStatus}
                        setSelectedStatus={setSelectedStatus}
                        suppliers={suppliers}
                        journalStatusOptions={journalStatusOptions}
                        clearFilters={clearFilters}
                    />

                    <ExpensesBySupplierChart data={filteredData} />

                    <ExpensesBySupplierTable data={filteredData} />
                </CardContent>
            </Card>
        </div>
    );
};

export default ExpensesBySupplierReport;
