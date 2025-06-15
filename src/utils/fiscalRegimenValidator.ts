
import { FiscalRegimen } from '@/types/fiscal';

/**
 * Simula la consulta del régimen fiscal de un contribuyente.
 * @param rfc El RFC a consultar.
 * @returns Una promesa que resuelve a un objeto con el régimen y un mensaje.
 */
export const getFiscalRegimen = async (rfc: string): Promise<{ regimen: FiscalRegimen; message: string; }> => {
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simular retraso de red

    // Lógica de simulación simple
    if (rfc.toUpperCase().endsWith('H05')) {
        return {
            regimen: 'Sueldos y Salarios e Ingresos Asimilados a Salarios',
            message: `El contribuyente con RFC ${rfc.toUpperCase()} se encuentra en el régimen de Sueldos y Salarios.`
        };
    }
    if (rfc.length === 12) { // Persona Moral
        return {
            regimen: 'Régimen General de Ley Personas Morales',
            message: `El contribuyente con RFC ${rfc.toUpperCase()} se encuentra en el Régimen General de Personas Morales.`
        };
    }
    if (rfc.length === 13) { // Persona Física
         return {
            regimen: 'Régimen Simplificado de Confianza',
            message: `El contribuyente con RFC ${rfc.toUpperCase()} se encuentra en el Régimen Simplificado de Confianza (RESICO).`
        };
    }

    return {
        regimen: 'No Encontrado',
        message: `No se pudo determinar el régimen fiscal para el RFC ${rfc.toUpperCase()}. Verifique que sea un RFC válido.`
    };
};
