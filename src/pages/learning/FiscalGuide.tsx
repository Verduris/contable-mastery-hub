
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Youtube } from "lucide-react";

const videoId = "kF4z6eZ-zK8";

const FiscalGuide = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Guía Fiscal Básica (CFF)</h1>
      <p className="text-muted-foreground">
        Entiende los fundamentos del Código Fiscal de la Federación (CFF) para cumplir correctamente con tus obligaciones.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Video Explicativo: El Código Fiscal de la Federación</CardTitle>
          <CardDescription>
            Este video desglosa la estructura y los conceptos más importantes del CFF de una manera clara y sencilla, ideal para quienes se inician en temas fiscales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video">
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Video Guía Fiscal Básica"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
           <Button variant="ghost" asChild>
              <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">
                <Youtube />
                Ver en YouTube
              </a>
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Recursos Adicionales
          </CardTitle>
          <CardDescription>
            Descarga nuestra guía con ejemplos prácticos y un resumen de los artículos más relevantes del CFF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/downloads/guia-cff-articulos-destacados.pdf" download>
              <Download />
              Descargar Guía del CFF en PDF
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FiscalGuide;
