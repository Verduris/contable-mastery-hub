
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
import { accounts as initialAccounts } from "@/data/accounts";
import { PlusCircle } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";

const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSaveAccount = (newAccountData: AddAccountFormData) => {
    const newAccount: Account = {
      id: (accounts.length + 1).toString(), // Simple ID generation
      ...newAccountData,
    };
    setAccounts([...accounts, newAccount]);
    setIsDialogOpen(false); // Close dialog on save
    toast({
        title: "¡Cuenta agregada!",
        description: `La cuenta "${newAccount.name}" ha sido creada exitosamente.`,
    })
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Catálogo de Cuentas</CardTitle>
            <CardDescription>Administra tus cuentas contables.</CardDescription>
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
        </Table>
      </CardContent>
    </Card>
  );
};

export default Accounts;
