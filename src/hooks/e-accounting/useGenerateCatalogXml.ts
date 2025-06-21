
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAccounts } from '@/queries/accounts';
import { useToast } from '@/hooks/use-toast';

export const useGenerateCatalogXml = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: accounts = [], error: accountsError } = useQuery({ 
    queryKey: ['accounts'], 
    queryFn: fetchAccounts 
  });

  // Handle accounts query error
  if (accountsError) {
    console.error('Error fetching accounts:', accountsError);
  }

  const generateXml = async () => {
    if (!accounts || accounts.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No hay cuentas disponibles para generar el XML.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate XML content for catalog
      const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
      const xmlContent = `<catalogocuentas:Catalogo 
        xmlns:catalogocuentas="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xsi:schemaLocation="http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas/CatalogoCuentas_1_3.xsd" 
        Version="1.3" 
        RFC="XAXX010101000" 
        Mes="01" 
        Anio="2025">
  ${accounts.map(account => `
  <catalogocuentas:Ctas 
    CodAgrup="${account.code}" 
    NumCta="${account.code}" 
    Desc="${account.name}" 
    Nivel="${account.level}" 
    Natur="${account.nature === 'Deudora' ? 'D' : 'A'}" />`).join('')}
</catalogocuentas:Catalogo>`;

      const fullXml = xmlHeader + xmlContent;

      // Create and download file
      const blob = new Blob([fullXml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `catalogo_cuentas_${new Date().getFullYear()}_${String(new Date().getMonth() + 1).padStart(2, '0')}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "XML generado",
        description: "El catálogo de cuentas se ha descargado correctamente.",
      });
    } catch (error) {
      console.error('Error generating XML:', error);
      toast({
        variant: "destructive",
        title: "Error al generar XML",
        description: error instanceof Error ? error.message : "Ocurrió un error al generar el archivo XML.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { generateXml, isLoading };
};
