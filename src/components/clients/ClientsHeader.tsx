
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { AddClientForm } from "@/components/AddClientForm";
import { Client, AddClientFormData } from "@/types/client";

interface ClientsHeaderProps {
  clients: Client[];
  onSaveClient: (data: AddClientFormData) => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (isOpen: boolean) => void;
}

export const ClientsHeader = ({ clients, onSaveClient, isAddDialogOpen, setIsAddDialogOpen }: ClientsHeaderProps) => {
  return (
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
            onSave={onSaveClient} 
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
