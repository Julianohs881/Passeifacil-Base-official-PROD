
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
          <Button onClick={onOpenCreateQuiz} className="min-w-[40px] min-h-[40px] flex-1 sm:flex-none">
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
        
        {/* Only show these buttons for premium users */}
        {hasPremiumAccess && (
          <>
            <Button 
              onClick={() => navigate("/explore")} 
              variant="outline" 
              className="min-w-[40px] min-h-[40px] flex-1 sm:flex-none border-blue-500 text-blue-900"
            >
              <span className="whitespace-nowrap">Explorar</span>
            </Button>
            
            <Button 
              onClick={onOpenImportDialog} 
              variant="outline" 
              className="min-w-[40px] min-h-[40px] flex-1 sm:flex-none font-normal text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap">Importar</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
