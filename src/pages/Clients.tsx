import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, FileText, CircleAlert } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddClientForm } from "@/components/AddClientForm";
import { ClientDetails } from "@/components/ClientDetails";
import { Client, AddClientFormData, ClientStatus } from "@/types/client";
import { JournalEntry } from "@/types/journal";
import { useToast } from "@/hooks/use-toast";
import { initialClients } from "@/data/clients";
import { journalEntries as initialJournalEntries } from "@/data/journalEntries";
import { compareAsc, differenceInDays } from "date-fns";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [journalEntries] = useState<JournalEntry[]>(initialJournalEntries);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "Todos">("Todos");
  const { toast } = useToast();

  const handleSaveClient = (newClientData: AddClientFormData) => {
    const newClient: Client = {
      id: (clients.length + 1).toString(),
      balance: 0,
      ...newClientData
    };
    setClients([...clients, newClient]);
    setIsAddDialogOpen(false);
    toast({
        title: "¡Cliente agregado!",
        description: `El cliente "${newClient.name}" ha sido creado exitosamente.`,
    })
  };
  
  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailDialogOpen(true);
  };

  const getClientHealthStatus = (client: Client) => {
    const clientEntries = journalEntries
      .filter(entry => entry.clientId === client.id)
      .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)));

    const lastPayment = clientEntries.filter(e => e.type === 'Egreso').pop();
    const daysSinceLastPayment = lastPayment ? differenceInDays(new Date(), new Date(lastPayment.date)) : Infinity;

    const isDelinquent = (client.creditDays ?? 0) > 0 && daysSinceLastPayment > (client.creditDays ?? 0) && client.balance > 0;
    const hasExhaustedCredit = (client.creditLimit ?? 0) > 0 && client.balance >= (client.creditLimit ?? 0);
    const hasNegativeBalance = client.balance < 0;

    const alertMessages = [];
    if (isDelinquent) alertMessages.push("Cliente en mora.");
    if (hasExhaustedCredit) alertMessages.push("Límite de crédito agotado o excedido.");
    if (hasNegativeBalance) alertMessages.push("Cliente con saldo a favor (negativo).");

    return { hasAlert: alertMessages.length > 0, message: alertMessages.join(' ') };
  }

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Completa el formulario para registrar un nuevo cliente.
                </DialogDescription>
              </DialogHeader>
              <AddClientForm 
                clients={clients}
                onSave={handleSaveClient} 
                onCancel={() => setIsAddDialogOpen(false)}
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
              <TableHead className="w-[40%]">Nombre / Razón Social</TableHead>
              <TableHead>RFC</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => {
              const health = getClientHealthStatus(client);
              return (
              <TableRow key={client.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {client.name}
                    {health.hasAlert && (
                        <Tooltip>
                          <TooltipTrigger>
                            <CircleAlert className="h-4 w-4 text-destructive" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{health.message}</p>
                          </TooltipContent>
                        </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell>{client.rfc}</TableCell>
                <TableCell>
                  <Badge variant={client.status === 'Activo' ? 'default' : 'destructive'}>
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(client.balance)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(client)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver detalles</span>
                    </Button>
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/clientes/${client.id}/estado-de-cuenta`}>
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Ver estado de cuenta</span>
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            {selectedClient && <ClientDetails client={selectedClient} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Clients;
