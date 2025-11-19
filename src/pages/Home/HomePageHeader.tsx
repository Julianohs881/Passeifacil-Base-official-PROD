import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface HomePageHeaderProps {
  onOpenCreateQuiz: () => void;
  onOpenImportDialog: () => void;
}

export const HomePageHeader = ({
  onOpenCreateQuiz,
  onOpenImportDialog
}: HomePageHeaderProps) => {
  const navigate = useNavigate();
  const { isPro, userProfile } = useAuth();
  const hasPremiumAccess = isPro();
  
  // Calculate AI usage metrics
  const aiQuestionsCreated = userProfile?.ai_questions_created || 0;
  const aiQuestionsLimit = 50;
  const aiQuestionsRemaining = Math.max(0, aiQuestionsLimit - aiQuestionsCreated);
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-0">Meus Quizzes</h1>
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <Button onClick={onOpenCreateQuiz} className="min-w-[40px] min-h-[40px] flex-1 sm:flex-none border-0">
            <PlusCircle className="h-4 w-4 mr-2" /> 
            <span className="whitespace-nowrap">Novo Quiz</span>
          </Button>
          
          {/* AI Usage Indicator for PRO users */}
          {hasPremiumAccess && (
            <div className="flex items-center gap-1 px-2 py-1 bg-violet-100 rounded-md text-sm">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <span className="text-violet-700 font-medium">
                {aiQuestionsRemaining} IA
              </span>
            </div>
          )}
        </div>
        
        {/* Botão de Upgrade para usuários gratuitos */}
        {!hasPremiumAccess && (
           <Button 
            onClick={() => navigate("/subscription")}
            className="bg-violet-600 hover:bg-violet-700 text-white min-w-[40px] min-h-[40px] flex-1 sm:flex-none"
          >
            PROimage.png
          </Button>
        )}

        {/* Botão Comunidade - disponível para todos os usuários */}
        <Button 
          onClick={() => navigate("/explore")} 
          variant="ghost" 
          className="min-w-[40px] min-h-[40px] flex-1 sm:flex-none text-blue-900 border-0"
        >
          <span className="whitespace-nowrap">Comunidade</span>
        </Button>
        
        {/* Botão Importar - apenas para usuários PRO */}
        {hasPremiumAccess && (
          <Button 
            onClick={onOpenImportDialog} 
            variant="ghost" 
            className="min-w-[40px] min-h-[40px] flex-1 sm:flex-none font-normal text-sm border-0"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="whitespace-nowrap">Importar</span>
          </Button>
        )}
      </div>
    </div>
  );
};
