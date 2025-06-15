
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, User, Users } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddClientForm } from "@/components/AddClientForm";
import { Client, AddClientFormData, ClientStatus } from "@/types/client";
import { useToast } from "@/hooks/use-toast";
import { initialClients } from "@/data/clients";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "Todos">("Todos");
  const { toast } = useToast();

  const handleSaveClient = (newClientData: AddClientFormData) => {
    const newClient: Client = {
      id: (clients.length + 1).toString(),
      ...newClientData
    };
    setClients([...clients, newClient]);
    setIsDialogOpen(false);
    toast({
        title: "¡Cliente agregado!",
        description: `El cliente "${newClient.name}" ha sido creado exitosamente.`,
    })
  };

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const searchMatch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.rfc.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'Todos' || client.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [clients, searchTerm, statusFilter]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>Administra los clientes de tu negocio.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Completa el formulario para registrar un nuevo cliente.
                </DialogDescription>
              </DialogHeader>
              <AddClientForm 
                clients={clients}
                onSave={handleSaveClient} 
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
          <Input 
            placeholder="Buscar por nombre o RFC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ClientStatus | "Todos")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre / Razón Social</TableHead>
              <TableHead>RFC</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Régimen Fiscal</TableHead>
              <TableHead>Estatus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.rfc}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        {client.type === 'Física' ? <User className="h-4 w-4 text-muted-foreground" /> : <Users className="h-4 w-4 text-muted-foreground" />}
                        <span>{client.type}</span>
                    </div>
                </TableCell>
                <TableCell>{client.taxRegime}</TableCell>
                <TableCell>
                  <Badge variant={client.status === 'Activo' ? 'default' : 'destructive'}>
                    {client.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Clients;
