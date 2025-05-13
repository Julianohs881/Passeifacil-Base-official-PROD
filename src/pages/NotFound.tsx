
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import NavBar from "@/components/NavBar";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-7xl font-bold text-violet-500 mb-4">404</h1>
          <h2 className="text-3xl font-semibold mb-6">Página não encontrada</h2>
          <p className="text-gray-600 mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
          
          <Link to="/">
            <Button className="bg-violet-500 hover:bg-violet-600 flex items-center space-x-2">
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar à página inicial</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
