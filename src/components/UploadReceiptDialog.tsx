
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, FileUp } from 'lucide-react';

interface UploadReceiptDialogProps {
  children: React.ReactNode;
  eventId: string;
}

export function UploadReceiptDialog({ children, eventId }: UploadReceiptDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (fileToUpload: File) => {
      const filePath = `public/${eventId}-${Date.now()}-${fileToUpload.name}`;
      const { error: uploadError } = await supabase.storage
        .from('tax_receipts')
        .upload(filePath, fileToUpload);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('tax_receipts')
        .getPublicUrl(filePath);

      if (!publicUrlData) {
        throw new Error("No se pudo obtener la URL pública del archivo.");
      }
      
      const { error: updateError } = await supabase.from('tax_events').update({ receipt_url: publicUrlData.publicUrl }).eq('id', eventId);

      if (updateError) {
        throw updateError;
      }
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tax_events'] });
        toast({
            title: "Acuse subido",
            description: "El acuse de pago se ha guardado correctamente.",
        });
        setOpen(false);
        setFile(null);
    },
    onError: (error: Error) => {
         toast({
            variant: "destructive",
            title: "Error al subir acuse",
            description: error.message,
        });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No hay archivo seleccionado",
        description: "Por favor, selecciona un archivo para subir.",
      });
      return;
    }
    uploadMutation.mutate(file);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!uploadMutation.isPending) {
            setOpen(isOpen);
            if (!isOpen) setFile(null);
        }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Subir Acuse de Pago</DialogTitle>
          <DialogDescription>
            Selecciona el archivo del acuse para guardarlo junto a la obligación.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="receipt-file">Archivo del acuse</Label>
            <Input
              id="receipt-file"
              type="file"
              onChange={handleFileChange}
              disabled={uploadMutation.isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleUpload} disabled={uploadMutation.isPending || !file}>
            {uploadMutation.isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                </>
            ) : (
                <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Subir y Guardar
                </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
