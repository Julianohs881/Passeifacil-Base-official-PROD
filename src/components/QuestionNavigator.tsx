
import { Question, QuizResult } from "../types";
import { Button } from "./ui/button";
import { CheckCircle } from "lucide-react";

interface QuestionNavigatorProps {
  questions: Question[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  answeredQuestions: Record<string, number>;
  quizResult?: QuizResult;
}

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  answeredQuestions,
  quizResult,
}) => {
  const isQuestionAnswered = (questionId: string) => {
    return answeredQuestions[questionId] !== undefined;
  };

  const isQuestionCorrect = (questionId: string, correctIndex: number) => {
    return answeredQuestions[questionId] === correctIndex;
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Questões</h3>
      
      <div className="grid grid-cols-5 gap-2 mb-4">
        {questions.map((question, index) => (
          <Button
            key={question.id}
            variant={currentQuestionIndex === index ? "default" : "outline"}
            size="sm"
            className={`
              relative h-10 w-10
              ${
                isQuestionAnswered(question.id) && 
                isQuestionCorrect(question.id, question.correct_index)
                  ? "border-green-500 bg-quiz-correct text-black hover:bg-green-100"
                  : ""
              }
              ${
                isQuestionAnswered(question.id) && 
                !isQuestionCorrect(question.id, question.correct_index)
                  ? "border-red-500 bg-quiz-incorrect text-black hover:bg-red-100"
                  : ""
              }
            `}
            onClick={() => onSelectQuestion(index)}
          >
            {index + 1}
            {isQuestionAnswered(question.id) && 
              isQuestionCorrect(question.id, question.correct_index) && (
              <span className="absolute -top-1 -right-1 h-3 w-3">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </span>
            )}
          </Button>
        ))}
      </div>
      
      {quizResult && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
          <h4 className="text-sm font-medium mb-2">Resultado</h4>
          <div className="flex justify-between text-sm mb-1">
            <span>Acertos:</span>
            <span className="font-medium">{quizResult.correctAnswers}/{quizResult.totalQuestions}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Porcentagem:</span>
            <span className="font-medium">{quizResult.percentage.toFixed(1)}%</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-violet-500 h-2.5 rounded-full"
              style={{ width: `${quizResult.percentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionNavigator;
