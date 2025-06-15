
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Landmark, Bot, Book, Briefcase, Award, ArrowRight } from 'lucide-react';

const mainCategories = [
  { 
    title: "Rutas de Aprendizaje por Módulo", 
    description: "Aprende a usar cada parte del sistema, desde Clientes hasta Impuestos.", 
    icon: GraduationCap, 
    href: "/aprendizaje/modulos" 
  },
  { 
    title: "Guía Fiscal Básica (CFF)", 
    description: "Entiende los fundamentos del Código Fiscal de la Federación con ejemplos prácticos.", 
    icon: Landmark, 
    href: "/aprendizaje/guia-fiscal" 
  },
  { 
    title: "Simuladores Educativos", 
    description: "Practica con simulaciones de facturación, declaraciones y auditorías del SAT.", 
    icon: Bot, 
    href: "/aprendizaje/simuladores" 
  },
  { 
    title: "Diccionario de Conceptos Clave", 
    description: "Busca y entiende términos fiscales y contables importantes.", 
    icon: Book, 
    href: "/aprendizaje/diccionario" 
  },
  { 
    title: "Casos Prácticos y Plantillas", 
    description: "Aplica tus conocimientos con escenarios reales y descarga formatos útiles.", 
    icon: Briefcase, 
    href: "/aprendizaje/casos-practicos" 
  },
  {
    title: "Mi Progreso e Insignias",
    description: "Visualiza tu avance, lecciones completadas y los reconocimientos que has ganado.",
    icon: Award,
    href: "/aprendizaje/progreso"
  }
];


const LearningCenter = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Centro de Aprendizaje</h1>
      <p className="text-muted-foreground">Tu plataforma de formación continua para dominar el sistema y tus obligaciones fiscales.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mainCategories.map((category) => (
          <Card key={category.title} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="flex-row items-center gap-4">
              <category.icon className="w-10 h-10 text-primary" />
              <CardTitle>{category.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to={category.href}>
                  Explorar <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LearningCenter;
