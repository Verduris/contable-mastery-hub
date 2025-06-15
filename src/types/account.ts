
export type Account = {
  id: string;
  code: string;
  name: string;
  type: 'Activo' | 'Pasivo' | 'Capital' | 'Ingresos' | 'Egresos';
  balance: number;
  nature: 'Deudora' | 'Acreedora';
  level: number;
  status: 'Activa' | 'Inactiva';
};
