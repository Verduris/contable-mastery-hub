
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-9xl font-black text-primary/20">404</h1>
      <p className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
        Página no encontrada
      </p>
      <p className="mt-4 text-muted-foreground">
        Lo sentimos, no pudimos encontrar la página que estás buscando.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Volver al Dashboard</Link>
      </Button>
    </div>
  );
};

export default NotFound;
