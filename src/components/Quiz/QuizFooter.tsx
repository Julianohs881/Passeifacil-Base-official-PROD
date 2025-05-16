
import React from "react";
import { Button } from "@/components/ui/button";
import CreateWithAIButton from "@/components/CreateWithAI/CreateWithAIButton";
import QuizNavigationButtons from "@/components/QuizNavigationButtons";
import { FileCode2 } from "lucide-react";

interface QuizFooterProps {
  quizId: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onAddQuestion: () => void;
  onQuestionCreated: () => void;
  onImportQuestion?: () => void; // New prop for importing questions
}

const QuizFooter: React.FC<QuizFooterProps> = ({
  quizId,
  currentQuestionIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onAddQuestion,
  onQuestionCreated,
  onImportQuestion,
}) => {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white border-t">
      <div className="flex items-center gap-2">
        <Button
          onClick={onAddQuestion}
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Adicionar Questão
        </Button>
        
        {/* New Import Question Button */}
        {onImportQuestion && (
          <Button
            onClick={onImportQuestion}
            size="sm"
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <FileCode2 className="mr-2 h-4 w-4" />
            Importar Questão por Código
          </Button>
        )}
        
        <CreateWithAIButton 
          quizId={quizId}
          onSuccess={onQuestionCreated}
        />
      </div>
      <QuizNavigationButtons
        currentIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  );
};

export default QuizFooter;
