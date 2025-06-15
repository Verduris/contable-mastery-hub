
import { SatStatus } from '@/types/invoice';

/**
 * Simula una llamada a un servicio para validar el estatus de un CFDI en el SAT.
 * En una aplicación real, esto haría una llamada de red a un backend.
 * @param uuid El Folio Fiscal (UUID) de la factura.
 * @returns Una promesa que resuelve al estatus de la factura ('Vigente' o 'Cancelada').
 */
export const validateSatStatus = async (uuid: string): Promise<SatStatus> => {
  console.log(`Validando estatus SAT para UUID: ${uuid}`);
  
  // Simula un retraso de red
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Lógica de simulación: para la demostración, si el UUID contiene 'b2c3d4e5' 
  // (de la factura cancelada de ejemplo), la marcaremos como 'Cancelada'.
  if (uuid.includes('b2c3d4e5')) {
    console.log('Respuesta simulada del SAT: Cancelada');
    return 'Cancelada';
  }
  
  console.log('Respuesta simulada del SAT: Vigente');
  return 'Vigente';
};
