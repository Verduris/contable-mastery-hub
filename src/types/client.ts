
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
  internalNotes?: string;
};

export type AddClientFormData = Omit<Client, 'id' | 'taxRegime' | 'address'> & {
  taxRegime: string;
  address: string;
};
