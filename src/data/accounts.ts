
import { Account } from '@/types/account';

export const accounts: Account[] = [
  { id: '1', code: '1101', name: 'Caja', type: 'Activo', balance: 15000.00 },
  { id: '2', code: '1102', name: 'Bancos', type: 'Activo', balance: 250000.00 },
  { id: '3', code: '1201', name: 'Clientes', type: 'Activo', balance: 75000.00 },
  { id: '4', code: '2101', name: 'Proveedores', type: 'Pasivo', balance: 45000.00 },
  { id: '5', code: '3101', name: 'Capital Social', type: 'Capital', balance: 300000.00 },
  { id: '6', code: '4101', name: 'Ventas', type: 'Ingresos', balance: 120000.00 },
  { id: '7', code: '5101', name: 'Gastos de Administración', type: 'Egresos', balance: 25000.00 },
];
