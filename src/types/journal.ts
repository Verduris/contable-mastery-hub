
import { Account } from './account';

export type JournalEntryLine = {
  id: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
};

export type JournalEntryType = 'Ingreso' | 'Egreso' | 'Diario';
export type JournalEntryStatus = 'Guardada' | 'Revisada' | 'Anulada';

export type JournalEntry = {
  id: string;
  number: string;
  date: string; // ISO string date
  concept: string;
  type: JournalEntryType;
  status: JournalEntryStatus;
  lines: JournalEntryLine[];
  reference?: string;
};

export type JournalEntryFormData = {
    number: string;
    date: Date;
    concept: string;
    type: JournalEntryType;
    reference?: string;
    lines: {
        accountId: string;
        description: string;
        debit: number;
        credit: number;
    }[];
};
