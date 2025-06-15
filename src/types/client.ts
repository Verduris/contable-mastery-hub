
export type ClientStatus = 'Activo' | 'Inactivo';
export type PersonType = 'Física' | 'Moral';

export type Client = {
  id: string;
  name: string;
  rfc: string;
  type: PersonType;
  email: string;
  phone: string;
  status: ClientStatus;
  taxRegime: string;
  address: string;
  cfdiUse?: string;
  associatedAccountId?: string | null;
  paymentMethod?: string;
  creditDays?: number;
  creditLimit?: number;
  balance: number;
  internalNotes?: string;
  contractUrl?: string;
};

export type AddClientFormData = Omit<Client, 'id' | 'taxRegime' | 'address' | 'balance' | 'contractUrl'> & {
  taxRegime: string;
  address: string;
};
