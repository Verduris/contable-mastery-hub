import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { XMLParser } from "fast-xml-parser";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/types/client";
import { Invoice, SatStatus } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";
import { validateSatStatus } from "@/utils/satApi";

const formSchema = z.object({
  clientId: z.string().min(1, "Debes seleccionar un cliente."),
  xmlFile: (typeof window !== 'undefined' ? z.instanceof(FileList) : z.any())
    .refine((files) => files?.length > 0, "Debes subir un archivo XML."),
  uuid: z.string(),
  date: z.string(),
  amount: z.number(),
  cfdiUse: z.string(),
  satStatus: z.enum(['Vigente', 'Cancelada']),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

interface AddInvoiceFormProps {
  clients: Client[];
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

export const AddInvoiceForm = ({ clients, onSave, onCancel }: AddInvoiceFormProps) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      uuid: "",
      date: "",
      cfdiUse: "",
      satStatus: 'Vigente',
      amount: 0,
    },
  });

  const fileRef = form.register("xmlFile");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const xmlText = e.target?.result as string;
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
          removeNSPrefix: true,
        });
        const jsonObj = parser.parse(xmlText);
        
        const comprobante = jsonObj.Comprobante;
        if (!comprobante) throw new Error("No se encontró el nodo 'Comprobante' en el XML.");

        const complemento = comprobante.Complemento;
        if (!complemento) throw new Error("No se encontró el nodo 'Complemento'.");

        const timbre = Array.isArray(complemento.TimbreFiscalDigital) ? complemento.TimbreFiscalDigital[0] : complemento.TimbreFiscalDigital;
        if (!timbre) throw new Error("No se encontró el nodo 'TimbreFiscalDigital'.");
        
        const receptor = comprobante.Receptor;
        if (!receptor) throw new Error("No se encontró el nodo 'Receptor'.");

        const uuid = timbre['@_UUID'];
        const date = comprobante['@_Fecha'];
        const amount = parseFloat(comprobante['@_Total']);
        const cfdiUse = receptor['@_UsoCFDI'];
        const receptorRfc = receptor['@_Rfc'];

        form.setValue('uuid', uuid);
        form.setValue('date', new Date(date).toISOString());
        form.setValue('amount', amount);
        form.setValue('cfdiUse', cfdiUse);
        form.clearErrors('xmlFile');

        const matchedClient = clients.find(c => c.rfc === receptorRfc);
        if (matchedClient) {
          form.setValue('clientId', matchedClient.id);
        } else {
            toast({
                variant: "destructive",
                title: "Cliente no encontrado",
                description: `No se encontró un cliente con el RFC ${receptorRfc}. Por favor, selecciónalo manualmente.`
            })
        }

        setIsVerifying(true);
        try {
          const status = await validateSatStatus(uuid);
          form.setValue('satStatus', status);
          toast({
            title: "Estatus SAT Verificado",
            description: `El estatus de la factura en el SAT es: ${status}.`,
            variant: status === 'Vigente' ? 'default' : 'destructive'
          });
        } catch (error) {
           toast({
            variant: "destructive",
            title: "Error de Validación SAT",
            description: "No se pudo verificar el estatus con el SAT. Por favor, selecciónalo manualmente.",
          });
        } finally {
            setIsVerifying(false);
        }

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error al leer XML",
          description: error.message || "El archivo no parece ser un CFDI válido.",
        });
        form.reset();
      }
    };
    reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "Error de lectura",
            description: "No se pudo leer el archivo.",
        });
    }
    reader.readAsText(file);
  };

  const onSubmit = (values: InvoiceFormValues) => {
    const newInvoice: Invoice = {
      id: values.uuid,
      uuid: values.uuid,
      clientId: values.clientId,
      date: values.date,
      amount: values.amount,
      cfdiUse: values.cfdiUse,
      satStatus: values.satStatus,
      fileName: values.xmlFile[0].name,
    };
    onSave(newInvoice);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="xmlFile"
          render={() => (
            <FormItem>
              <FormLabel>Archivo XML de la Factura</FormLabel>
              <FormControl>
                <Input type="file" accept=".xml" {...fileRef} onChange={handleFileChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="satStatus"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Estatus SAT</FormLabel>
                <div className="flex items-center gap-2">
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isVerifying}>
                      <FormControl>
                      <SelectTrigger>
                          <SelectValue placeholder="Estatus en el SAT" />
                      </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="Vigente">Vigente</SelectItem>
                          <SelectItem value="Cancelada">Cancelada</SelectItem>
                      </SelectContent>
                  </Select>
                  {isVerifying && <Loader className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="p-4 border rounded-md bg-muted/50 space-y-4">
            <h4 className="font-medium text-sm">Datos del CFDI</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="uuid"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Folio Fiscal (UUID)</FormLabel>
                        <FormControl>
                            <Input {...field} readOnly placeholder="Se llenará desde el XML" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Monto</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} readOnly placeholder="Se llenará desde el XML" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Fecha</FormLabel>
                        <FormControl>
                            <Input {...field} readOnly placeholder="Se llenará desde el XML" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="cfdiUse"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Uso CFDI</FormLabel>
                        <FormControl>
                            <Input {...field} readOnly placeholder="Se llenará desde el XML" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={isVerifying}>
            {isVerifying ? "Verificando..." : "Guardar Factura"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
