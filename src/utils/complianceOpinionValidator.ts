
import { ComplianceStatus } from '@/types/fiscal';

/**
 * Simula la consulta de la Opinión de Cumplimiento de Obligaciones Fiscales.
 * @param rfc El RFC a consultar.
 * @returns Una promesa que resuelve a un objeto con el estatus y un mensaje.
 */
export const getComplianceOpinion = async (rfc: string): Promise<{ status: ComplianceStatus; message: string; pdfUrl?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simular retraso de red

    const upperRfc = rfc.toUpperCase();

    if (upperRfc.endsWith('OK1')) {
        return {
            status: 'Positiva',
            message: `El contribuyente con RFC ${upperRfc} tiene una opinión de cumplimiento positiva. Se encuentra al corriente de sus obligaciones fiscales.`,
            pdfUrl: '/dummy-opinion.pdf'
        };
    }
    if (upperRfc.endsWith('BAD2')) {
        return {
            status: 'Negativa',
            message: `El contribuyente con RFC ${upperRfc} tiene una opinión de cumplimiento negativa. Se detectaron omisiones en sus obligaciones.`,
            pdfUrl: '/dummy-opinion.pdf'
        };
    }
    if (upperRfc.endsWith('PEN3')) {
        return {
            status: 'En Proceso de Aclaración',
            message: `El contribuyente con RFC ${upperRfc} se encuentra en proceso de aclaración. Contacte al SAT para más detalles.`,
            pdfUrl: '/dummy-opinion.pdf'
        };
    }
    
    // Default case
    if (upperRfc.length >= 12) {
         return {
            status: 'Positiva',
            message: `El contribuyente con RFC ${upperRfc} tiene una opinión de cumplimiento positiva.`,
            pdfUrl: '/dummy-opinion.pdf'
        };
    }

    return {
        status: 'No Encontrada',
        message: `No se pudo obtener la opinión de cumplimiento para el RFC ${upperRfc}. Verifique que sea un RFC válido.`
    };
};
