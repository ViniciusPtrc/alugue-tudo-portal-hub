
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-foreground mb-6">
          Oops! A página que você está procurando não existe.
        </p>
        <p className="text-muted-foreground mb-8">
          A página solicitada não pôde ser encontrada. Verifique o URL ou volte para a página inicial.
        </p>
        <Button asChild>
          <a href="/">
            <Home className="h-4 w-4 mr-2" />
            Voltar para o Início
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
