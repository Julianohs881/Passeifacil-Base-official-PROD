
import { Button } from "@/components/ui/button";
import { PlusCircle, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HomePageHeaderProps {
  onOpenCreateQuiz: () => void;
  onOpenImportDialog: () => void;
}

export const HomePageHeader = ({ onOpenCreateQuiz, onOpenImportDialog }: HomePageHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 className="text-2xl font-bold mb-4 md:mb-0">Meus Quizzes</h1>
      <div className="flex items-center space-x-2 w-full md:w-auto">
        <Button 
          onClick={onOpenCreateQuiz}
          className="flex-1 md:flex-none"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> 
          Novo Quiz
        </Button>
        <Button 
          onClick={() => navigate("/explore")}
          variant="outline"
          className="flex-1 md:flex-none border-blue-500 text-blue-900"
        >
          Explorar
        </Button>
        <Button
          onClick={onOpenImportDialog}
          variant="outline"
          className="flex-1 md:flex-none"
        >
          <Download className="h-4 w-4 mr-2" />
          Importar por Código
        </Button>
      </div>
    </div>
  );
};
