
import React from "react";
import { Button } from "@/components/ui/button";
import QuizNavigationButtons from "@/components/QuizNavigationButtons";
import { FileCode2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMediaQuery } from "@/hooks/use-mobile";

interface QuizFooterProps {
  quizId: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onAddQuestion?: () => void;
  onQuestionCreated: () => void;
  onImportQuestion?: () => void;
}

const QuizFooter: React.FC<QuizFooterProps> = ({
  quizId,
  currentQuestionIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onQuestionCreated,
  onImportQuestion,
}) => {
  const { isPro } = useAuth();
  const isPROUser = isPro();
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-4 bg-white border-t gap-4">
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
        {/* Import Question Button - only show for PRO users */}
        {onImportQuestion && isPROUser && (
          <Button
            onClick={onImportQuestion}
            size="sm"
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50 border-0"
          >
            <FileCode2 className="mr-2 h-4 w-4" />
            Importar Questão
          </Button>
        )}
      </div>
      
      {/* Only show navigation buttons in footer on desktop */}
      {!isMobile && (
        <div className="w-full sm:w-auto flex justify-center sm:justify-end mt-2 sm:mt-0">
          <QuizNavigationButtons
            currentIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </div>
      )}
    </div>
  );
};

export default QuizFooter;
