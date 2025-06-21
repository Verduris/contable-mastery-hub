
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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
    mutationFn: async (file: File) => {
      try {
        // Create a simple data URL for the file (for demo purposes)
        // In a real implementation, you would upload to Supabase Storage
        const reader = new FileReader();
        return new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Error reading file'));
          reader.readAsDataURL(file);
        });
      } catch (error) {
        console.error('Error processing file:', error);
        throw new Error('Error al procesar el archivo');
      }
    },
    onSuccess: async (dataUrl) => {
      try {
        // Update the tax event with the receipt URL
        const { error } = await supabase
          .from('tax_events')
          .update({ receipt_url: dataUrl })
          .eq('id', eventId);

        if (error) {
          console.error('Supabase error:', error);
          throw new Error(error.message);
        }

        queryClient.invalidateQueries({ queryKey: ['tax_events'] });
        setOpen(false);
        setFile(null);
        toast({
          title: "Acuse subido",
          description: "El acuse se ha subido correctamente.",
        });
      } catch (error) {
        console.error('Error updating tax event:', error);
        throw error;
      }
    },
    onError: (error: Error) => {
      console.error('Upload mutation error:', error);
      toast({
        variant: "destructive",
        title: "Error al subir acuse",
        description: error.message || "Ocurrió un error al subir el acuse.",
      });
    }
  });

  const handleSubmit = () => {
    if (file) {
      uploadMutation.mutate(file);
    } else {
      toast({
        variant: "destructive",
        title: "Archivo requerido",
        description: "Por favor selecciona un archivo para subir.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Subir Acuse</DialogTitle>
          <DialogDescription>
            Sube el acuse de recibo de la obligación presentada.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              Archivo
            </Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={uploadMutation.isPending || !file}
          >
            {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Subir Acuse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
