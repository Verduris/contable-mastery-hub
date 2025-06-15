
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { accounts } from "@/data/accounts";
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Accounts = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Catálogo de Cuentas</CardTitle>
            <CardDescription>Administra tus cuentas contables.</CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Cuenta
          </Button>
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
