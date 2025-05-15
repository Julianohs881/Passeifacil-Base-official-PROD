
import React from "react";
import { Button } from "@/components/ui/button";
import CreateWithAIButton from "@/components/CreateWithAI/CreateWithAIButton";

interface QuizEmptyStateProps {
  quizId: string;
  onAddQuestion: () => void;
  onQuestionCreated: () => void;
}

const QuizEmptyState: React.FC<QuizEmptyStateProps> = ({
  quizId,
  onAddQuestion,
  onQuestionCreated,
}) => {
  return (
    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-600 mb-4">
        Este quiz ainda não tem questões
      </h3>
      <p className="text-gray-500 mb-6">
        Adicione questões para começar.
      </p>
      <div className="flex justify-center gap-3">
        <Button 
          onClick={onAddQuestion}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
        >
          Adicionar Questão
        </Button>
        <CreateWithAIButton 
          quizId={quizId}
          onSuccess={onQuestionCreated}
        />
      </div>
    </div>
  );
};

export default QuizEmptyState;
