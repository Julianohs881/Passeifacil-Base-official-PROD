
import React from "react";
import { Button } from "@/components/ui/button";
import CreateWithAIButton from "@/components/CreateWithAI/CreateWithAIButton";
import QuizNavigationButtons from "@/components/QuizNavigationButtons";

interface QuizFooterProps {
  quizId: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onAddQuestion: () => void;
  onQuestionCreated: () => void;
}

const QuizFooter: React.FC<QuizFooterProps> = ({
  quizId,
  currentQuestionIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onAddQuestion,
  onQuestionCreated,
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
