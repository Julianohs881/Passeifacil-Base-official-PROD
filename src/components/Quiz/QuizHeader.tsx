import React from "react";
import { ArrowLeft, Plus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import CreateWithAIButton from "@/components/CreateWithAI/CreateWithAIButton";

interface QuizHeaderProps {
  title?: string;
  quizId?: string;
  onAddQuestion?: () => void;
  onQuestionCreated?: () => void;
  isCreator?: boolean;
  onImportQuestion?: () => void;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({ 
  title, 
  quizId, 
  onAddQuestion, 
  onQuestionCreated,
  isCreator,
  onImportQuestion
}) => {
  const navigate = useNavigate();
  const { isPro } = useAuth();
  const isPROUser = isPro();

  return (
    <div className="bg-white border-b px-4 py-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 border-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            {title && (
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {title}
              </h1>
            )}
          </div>
          
          {/* Action buttons - only show for creators */}
          {isCreator && onAddQuestion && (
            <div className="flex items-center gap-2">
              <Button
                onClick={onAddQuestion}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Questão
              </Button>
              {/* Botão Importar Questão - só para PRO */}
              {isPROUser && quizId && onImportQuestion && (
                <Button
                  onClick={onImportQuestion}
                  size="sm"
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  type="button"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Importar questão
                </Button>
              )}
              {/* Only render the CreateWithAIButton for PRO users */}
              {isPROUser && quizId && onQuestionCreated && (
                <CreateWithAIButton 
                  quizId={quizId}
                  onSuccess={onQuestionCreated}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizHeader;
