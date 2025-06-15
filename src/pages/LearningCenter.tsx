
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Landmark, Presentation, Briefcase, FileDigit, Award, ArrowRight } from 'lucide-react';

const categories = [
  { title: "Contabilidad Básica", description: "Fundamentos esenciales para empezar en el mundo contable.", icon: BookOpen, href: "/aprendizaje/basica" },
  { title: "Contabilidad Intermedia", description: "Profundiza en temas complejos y normativas.", icon: Award, href: "/aprendizaje/intermedia" },
  { title: "Contabilidad Fiscal", description: "Todo sobre impuestos, declaraciones y el SAT.", icon: Landmark, href: "/aprendizaje/fiscal" },
  { title: "Contabilidad Electrónica", description: "Cumplimiento y envío de información al SAT.", icon: FileDigit, href: "/aprendizaje/electronica" },
  { title: "Normas de Información Financiera (NIF)", description: "Aprende a aplicar las NIF en tus registros.", icon: Presentation, href: "/aprendizaje/nif" },
  { title: "Casos Prácticos", description: "Aplica tus conocimientos con ejemplos reales.", icon: Briefcase, href: "/aprendizaje/casos-practicos" },
];

const LearningCenter = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Centro de Aprendizaje Contable</h1>
      <p className="text-muted-foreground">Tu camino para convertirte en un experto contable. Elige una categoría para comenzar.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
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
                  Comenzar a aprender <ArrowRight className="ml-2 h-4 w-4" />
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
