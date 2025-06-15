
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Account } from "@/types/account";

const formSchemaBase = z.object({
  code: z.string().min(1, "El código es requerido.").refine((val) => /^\d+$/.test(val), {
    message: "El código debe ser numérico.",
  }),
  name: z.string().min(1, "El nombre es requerido."),
  type: z.enum(["Activo", "Pasivo", "Capital", "Ingresos", "Egresos"]),
  nature: z.enum(["Deudora", "Acreedora"]),
  level: z.coerce.number().min(1, "El nivel debe ser al menos 1."),
  balance: z.coerce.number().nonnegative("El balance inicial no puede ser negativo."),
  status: z.enum(["Activa", "Inactiva"]),
  parentId: z.string().optional().nullable(),
  satCode: z.string().optional(),
  description: z.string().optional(),
});

export type AddAccountFormData = z.infer<typeof formSchemaBase>;

type AddAccountFormProps = {
  accounts: Account[];
  onSave: (account: AddAccountFormData) => void;
  onCancel: () => void;
};

export const AddAccountForm = ({ accounts, onSave, onCancel }: AddAccountFormProps) => {
  const formSchema = formSchemaBase
    .refine((data) => !accounts.some((acc) => acc.code === data.code), {
      message: "Este código de cuenta ya existe.",
      path: ["code"],
    })
    .refine((data) => (data.level > 1 ? !!data.parentId : true), {
      message: "Debe seleccionar una cuenta padre para niveles superiores a 1.",
      path: ["parentId"],
    });

  const form = useForm<AddAccountFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "Activo",
      nature: "Deudora",
      level: 1,
      balance: 0,
      status: "Activa",
      parentId: null,
      satCode: "",
      description: "",
    },
  });

  const level = form.watch("level");
  const parentAccounts = accounts.filter(acc => acc.level === level - 1);

  function onSubmit(values: AddAccountFormData) {
    onSave(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Input placeholder="Ej. Caja General" {...field} />
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
                    <div className="flex items-center gap-1">
                        <FormLabel>Naturaleza</FormLabel>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Deudora: Aumenta con cargos.<br/>Acreedora: Aumenta con abonos.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
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
                        <Input type="number" placeholder="Ej. 1" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Cuenta Padre</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={level <= 1}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona una cuenta padre" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {parentAccounts.length > 0 ? parentAccounts.map(account => (
                                <SelectItem key={account.id} value={account.id}>{account.code} - {account.name}</SelectItem>
                            )) : <SelectItem value="-" disabled>No hay cuentas padre disponibles para este nivel</SelectItem>}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
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
        <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Estatus</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estatus" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Activa">Activa</SelectItem>
                        <SelectItem value="Inactiva">Inactiva</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />
         <FormField
          control={form.control}
          name="satCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Agrupador SAT <span className="text-muted-foreground">(Opcional)</span></FormLabel>
              <FormControl>
                <Input placeholder="Ej. 101.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción o Comentarios <span className="text-muted-foreground">(Opcional)</span></FormLabel>
              <FormControl>
                <Textarea placeholder="Añade una descripción sobre el uso de la cuenta..." {...field} />
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
