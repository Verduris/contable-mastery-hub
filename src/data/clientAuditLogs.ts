
import { AuditLogEvent } from '@/types/client';

export const initialClientAuditLogs: AuditLogEvent[] = [
  {
    id: 'log1',
    clientId: '1',
    timestamp: '2025-05-10T10:00:00Z',
    user: 'Sistema',
    action: 'Cliente Creado',
  },
  {
    id: 'log2',
    clientId: '1',
    timestamp: '2025-05-20T14:30:00Z',
    user: 'Ana López',
    action: 'Límite de crédito actualizado',
    details: 'Se cambió de $25,000.00 a $50,000.00',
  },
  {
    id: 'log3',
    clientId: '3',
    timestamp: '2025-06-01T09:00:00Z',
    user: 'Sistema',
    action: 'Cliente Creado',
  },
  {
    id: 'log4',
    clientId: '3',
    timestamp: '2025-06-10T11:00:00Z',
    user: 'Carlos Ruiz',
    action: 'Estatus cambiado a Inactivo',
  },
];
