
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientDetails } from "@/components/ClientDetails";
import { Client, AddClientFormData, ClientStatus } from "@/types/client";
import { JournalEntry } from "@/types/journal";
import { useToast } from "@/hooks/use-toast";
import { ClientsHeader } from "@/components/clients/ClientsHeader";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { fetchAccounts } from "@/queries/accounts";
import { Account } from "@/types/account";
import { fetchClients, addClient } from "@/queries/clients";
import { fetchJournalEntries } from "@/queries/journalEntries";

const Clients = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "Todos">("Todos");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery<Client[]>({
      queryKey: ["clients"],
      queryFn: fetchClients,
  });

  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
      queryKey: ["journalEntries"],
      queryFn: () => fetchJournalEntries(),
  });

  const addClientMutation = useMutation({
      mutationFn: addClient,
      onSuccess: (newClient) => {
          queryClient.invalidateQueries({ queryKey: ['clients'] });
          setIsAddDialogOpen(false);
          toast({
              title: "¡Cliente agregado!",
              description: `El cliente "${newClient.name}" ha sido creado exitosamente.`,
          });
      },
      onError: (error: Error) => {
          toast({
              title: "Error al agregar cliente",
              description: error.message,
              variant: "destructive",
          });
      }
  });

  const handleSaveClient = (newClientData: AddClientFormData) => {
    addClientMutation.mutate(newClientData);
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
        {isLoadingClients ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ClientsTable 
            clients={filteredClients} 
            journalEntries={journalEntries} 
            onViewDetails={handleViewDetails}
          />
        )}
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
