
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
import { Account } from "@/types/account";

const formSchema = z.object({
  code: z.string().min(1, "El código es requerido."),
  name: z.string().min(1, "El nombre es requerido."),
  type: z.enum(["Activo", "Pasivo", "Capital", "Ingresos", "Egresos"]),
  nature: z.enum(["Deudora", "Acreedora"]),
  level: z.coerce.number().min(1, "El nivel debe ser al menos 1."),
  balance: z.coerce.number(),
});

type AddAccountFormProps = {
  onSave: (account: Omit<Account, 'id' | 'status'>) => void;
  onCancel: () => void;
};

export const AddAccountForm = ({ onSave, onCancel }: AddAccountFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "Activo",
      nature: "Deudora",
      level: 1,
      balance: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código</FormLabel>
              <FormControl>
                <Input placeholder="Ej. 1101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Caja" {...field} />
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
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Pasivo">Pasivo</SelectItem>
                        <SelectItem value="Capital">Capital</SelectItem>
                        <SelectItem value="Ingresos">Ingresos</SelectItem>
                        <SelectItem value="Egresos">Egresos</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="nature"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Naturaleza</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona la naturaleza" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Deudora">Deudora</SelectItem>
                        <SelectItem value="Acreedora">Acreedora</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ej. 3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Balance Inicial</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ej. 15000.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Guardar Cuenta</Button>
        </div>
      </form>
    </Form>
  );
};
