
import { useQuery } from '@tanstack/react-query';
import { XMLBuilder } from 'fast-xml-parser';
import { fetchAccounts } from '@/queries/accounts';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// TODO: Reemplazar con los datos reales de la empresa.
const COMPANY_RFC = 'XEXX010101000';

export const useGenerateCatalogXml = () => {
    const { toast } = useToast();
    const { data: accounts, isLoading } = useQuery({ queryKey: ['accounts'], queryFn: fetchAccounts });

    const generateXml = () => {
        if (!accounts || accounts.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No hay cuentas',
                description: 'No se encontraron cuentas en el catálogo para generar el archivo.',
            });
            return;
        }
        
        const now = new Date();
        const year = format(now, 'yyyy');
        const month = format(now, 'MM');

        const catalogObject = {
            'catalogocuentas:Catalogo': {
                '@_xmlns:catalogocuentas': 'http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas',
                '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                '@_xsi:schemaLocation': 'http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas/CatalogoCuentas_1_3.xsd',
                '@_Version': '1.3',
                '@_RFC': COMPANY_RFC,
                '@_Mes': month,
                '@_Anio': year,
                'catalogocuentas:Ctas': accounts
                    .filter(account => account.code && account.name && account.level && account.nature && account.sat_code)
                    .map(account => ({
                    '@_CodAgrup': account.sat_code,
                    '@_NumCta': account.code,
                    '@_Desc': account.name,
                    '@_SubCtaDe': accounts.find(a => a.id === account.parent_id)?.code || '',
                    '@_Nivel': account.level,
                    '@_Natur': account.nature === 'Deudora' ? 'D' : 'A',
                }))
            }
        };

        const builder = new XMLBuilder({
            attributeNamePrefix: '@_',
            ignoreAttributes: false,
            format: true,
            suppressBooleanAttributes: false,
            suppressEmptyNode: true,
        });

        const xmlContent = '<?xml version="1.0" encoding="utf-8"?>\n' + builder.build(catalogObject);
        
        const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${COMPANY_RFC}${year}${month}CT.xml`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
            title: 'XML Generado',
            description: 'El archivo del Catálogo de Cuentas ha sido descargado.',
        });
    };

    return { generateXml, isLoading };
};
