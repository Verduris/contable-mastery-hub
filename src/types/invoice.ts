
import { Client } from './client';
import { JournalEntryStatus } from './journal';

export type SatStatus = 'Vigente' | 'Cancelada';

export type Invoice = {
  id: string; // Folio Fiscal (UUID)
  uuid: string; // Folio Fiscal (UUID)
  clientId: string;
  date: string; // ISO string
  amount: number;
  cfdiUse: string;
  satStatus: SatStatus;
  journalEntryId?: string;
  fileName?: string;
  journalEntry?: {
    id: string;
    number: string;
    status?: JournalEntryStatus;
  };
};
