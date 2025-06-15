
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ClientDetails } from "@/components/ClientDetails";
import { Client, AddClientFormData, ClientStatus } from "@/types/client";
import { JournalEntry } from "@/types/journal";
import { useToast } from "@/hooks/use-toast";
import { initialClients } from "@/data/clients";
import { journalEntries as initialJournalEntries } from "@/data/journalEntries";
import { ClientsHeader } from "@/components/clients/ClientsHeader";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { fetchAccounts } from "@/queries/accounts";
import { Account } from "@/types/account";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [journalEntries] = useState<JournalEntry[]>(initialJournalEntries);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "Todos">("Todos");
  const { toast } = useToast();

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

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
        <ClientsHeader 
          clients={clients}
          onSaveClient={handleSaveClient}
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
        />
        <ClientFilters 
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </CardHeader>
      <CardContent>
        <ClientsTable 
          clients={filteredClients} 
          journalEntries={journalEntries} 
          onViewDetails={handleViewDetails}
        />
      </CardContent>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            {selectedClient && <ClientDetails client={selectedClient} accounts={accounts} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Clients;
