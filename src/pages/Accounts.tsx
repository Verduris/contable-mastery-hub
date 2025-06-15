import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddAccountForm, type AddAccountFormData } from "@/components/AddAccountForm";
import { Account } from "@/types/account";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchAccounts } from "@/queries/accounts";

async function fetchAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("id, code, name, type, balance, nature, level, status, parent_id, sat_code, description")
    .order("code", { ascending: true });

  if (error) {
    console.error("Error fetching accounts:", error);
    throw new Error("No se pudieron cargar las cuentas.");
  }

  return data.map(a => ({
      id: a.id,
      code: a.code,
      name: a.name,
      type: a.type,
      balance: a.balance,
      nature: a.nature,
      level: a.level,
      status: a.status,
      parentId: a.parent_id,
      satCode: a.sat_code,
      description: a.description
  })) as Account[];
}

const Accounts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, isError, error } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  const addAccountMutation = useMutation({
    mutationFn: async (newAccountData: AddAccountFormData) => {
        const dataToInsert = {
            code: newAccountData.code,
            name: newAccountData.name,
            type: newAccountData.type,
            nature: newAccountData.nature,
            level: newAccountData.level,
            balance: newAccountData.balance,
            status: newAccountData.status,
            parent_id: newAccountData.parentId || null,
            sat_code: newAccountData.satCode,
            description: newAccountData.description,
        };
        
        const { data, error } = await supabase.from("accounts").insert([dataToInsert]).select();

        if (error) {
            console.error("Error inserting account:", error);
            if (error.code === '23505') { // unique_violation
                 throw new Error(`El código de cuenta '${newAccountData.code}' ya existe.`);
            }
            throw new Error("No se pudo agregar la cuenta.");
        }
        return data;
    },
    onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        setIsDialogOpen(false);
        toast({
            title: "¡Cuenta agregada!",
            description: `La cuenta "${variables.name}" ha sido creada exitosamente.`,
        });
    },
    onError: (error: Error) => {
        toast({
            title: "Error al agregar cuenta",
            description: error.message,
            variant: "destructive",
        });
    },
  });

  const handleSaveAccount = (newAccountData: AddAccountFormData) => {
    addAccountMutation.mutate(newAccountData);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <TableBody>
          {Array.from({ length: 8 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-48" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }

    if (isError) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error al Cargar Cuentas</AlertTitle>
                <AlertDescription>
                  {error instanceof Error ? error.message : "Ocurrió un error inesperado."}
                </AlertDescription>
              </Alert>
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }
    
    return (
       <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.code}</TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.type}</TableCell>
                <TableCell>{account.nature}</TableCell>
                <TableCell className="text-center">{account.level}</TableCell>
                <TableCell>
                  <Badge variant={account.status === 'Activa' ? 'default' : 'destructive'}>
                    {account.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {account.balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Catálogo de Cuentas</CardTitle>
            <CardDescription>Administra tus cuentas contables desde la base de datos.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Cuenta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Nueva Cuenta</DialogTitle>
                <DialogDescription>
                  Completa el formulario para agregar una nueva cuenta a tu catálogo.
                </DialogDescription>
              </DialogHeader>
              <AddAccountForm 
                accounts={accounts}
                onSave={handleSaveAccount} 
                onCancel={() => setIsDialogOpen(false)}
                isSaving={addAccountMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Naturaleza</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          {renderContent()}
        </Table>
      </CardContent>
    </Card>
  );
};

export default Accounts;
