
import { Client } from '@/types/client';

export const initialClients: Client[] = [
  {
    id: '1',
    name: 'Soluciones Web Creativas S.A. de C.V.',
    rfc: 'SWC120315ABC',
    type: 'Moral',
    email: 'contacto@swc.com.mx',
    phone: '5512345678',
    status: 'Activo',
    taxRegime: 'Régimen General de Ley Personas Morales',
    address: 'Av. Insurgentes Sur 123, Roma Norte, CDMX',
  },
  {
    id: '2',
    name: 'Juan Pérez Rodríguez',
    rfc: 'PERJ850101HDA',
    type: 'Física',
    email: 'juan.perez@email.com',
    phone: '5587654321',
    status: 'Activo',
    taxRegime: 'Régimen Simplificado de Confianza',
    address: 'Calle Falsa 123, Colonia Centro, Puebla',
  },
  {
    id: '3',
    name: 'Marketing Digital Avanzado SC',
    rfc: 'MDA010203XYZ',
    type: 'Moral',
    email: 'info@mda.mx',
    phone: '8112349876',
    status: 'Inactivo',
    taxRegime: 'Régimen General de Ley Personas Morales',
    address: 'Av. Lázaro Cárdenas 456, San Pedro, Monterrey',
  },
];
