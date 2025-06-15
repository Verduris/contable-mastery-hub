
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Client, AddClientFormData } from "@/types/client";
import { useQuery } from "@tanstack/react-query";
import { fetchAccounts } from "@/queries/accounts";

interface AddClientFormProps {
  clients: Client[];
  onSave: (data: AddClientFormData) => void;
  onCancel: () => void;
}

const rfcRegex = new RegExp(/^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/);

export const AddClientForm = ({ clients, onSave, onCancel }: AddClientFormProps) => {

  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  const clientSchema = z.object({
    name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
    rfc: z.string()
      .regex(rfcRegex, { message: "El formato del RFC no es válido." })
      .refine(rfc => !clients.some(client => client.rfc === rfc.toUpperCase()), { message: "Este RFC ya está registrado." }),
    email: z.string().email({ message: "El correo electrónico no es válido." }),
    phone: z.string().min(10, { message: "El teléfono debe tener al menos 10 dígitos." }),
    address: z.string().min(5, { message: "La dirección es requerida." }),
    taxRegime: z.string().min(3, { message: "El régimen fiscal es requerido." }),
    type: z.enum(["Física", "Moral"], { required_error: "Debe seleccionar un tipo de persona." }),
    status: z.enum(["Activo", "Inactivo"], { required_error: "Debe seleccionar un estatus." }),
    associatedAccountId: z.string().nullable().optional(),
    creditLimit: z.coerce.number().min(0, "El límite de crédito no puede ser negativo.").optional(),
    creditDays: z.coerce.number().int().min(0, "Los días de crédito no pueden ser negativos.").optional(),
    internalNotes: z.string().optional(),
  }).transform(data => ({
      ...data,
      rfc: data.rfc.toUpperCase(),
      associatedAccountId: data.associatedAccountId === 'null' ? null : data.associatedAccountId,
  }));
  
  const form = useForm<AddClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      rfc: "",
      email: "",
      phone: "",
      address: "",
      taxRegime: "",
      type: "Física",
      status: "Activo",
      associatedAccountId: null,
      creditLimit: 0,
      creditDays: 0,
      internalNotes: "",
    },
  });

  const onSubmit = (data: AddClientFormData) => {
    onSave(data);
  };
  
  const clientAccounts = accounts.filter(account => account.name.toLowerCase().includes('cliente'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Nombre completo o Razón Social</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Juan Pérez o Empresa S.A. de C.V." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rfc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RFC</FormLabel>
              <FormControl>
                <Input placeholder="Ej. ABCD123456E78" {...field} className="uppercase"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Persona</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Física">Física</SelectItem>
                  <SelectItem value="Moral">Moral</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input type="email" placeholder="ej. correo@dominio.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="Ej. 5512345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Av. Siempre Viva 123, Springfield" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="taxRegime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Régimen Fiscal</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Régimen Simplificado de Confianza" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estatus</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un estatus" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="creditLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Límite de Crédito (MXN)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="creditDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Días de Crédito</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="associatedAccountId"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Cuenta Contable Asociada</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || undefined} disabled={isLoadingAccounts}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una cuenta contable" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">Ninguna</SelectItem>
                  {clientAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="internalNotes"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Notas Internas</FormLabel>
              <FormControl>
                <Textarea placeholder="Añadir condiciones comerciales, recordatorios, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="md:col-span-2 flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Cliente</Button>
        </div>
      </form>
    </Form>
  );
};
