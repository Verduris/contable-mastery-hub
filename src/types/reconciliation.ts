
export type BankTransaction = {
  id: string;
  date: string; // ISO string
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'unreconciled' | 'reconciled' | 'mismatch';
  journalEntryId?: string; // Link to the reconciled journal entry
};
