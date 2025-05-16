
import React, { useState } from "react";
import { Question, isUserCreator } from "../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CommentSection from "./Comments/CommentSection";
import { useAuth } from "@/context/AuthContext";
import { ShareCodeDialog } from "./Share/ShareCodeDialog";

interface QuestionCardProps {
  question: Question;
  userAnswers: Record<string, number>;
  handleAnswer: (optionIndex: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
  currentIndex: number;
  totalQuestions: number;
  isPublicQuiz?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  userAnswers,
  handleAnswer,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteQuestion,
  currentIndex,
  totalQuestions,
  isPublicQuiz = false,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const userAnswer = userAnswers[question.id];
  const isAnswered = userAnswer !== undefined;
  const isCorrect = userAnswer === question.correct_index;
  const { user } = useAuth();
  
  // Verificar se o usuário atual é o criador do quiz
  const isCreator = user?.id === question.user_id;

  // Function to render the statement with proper line breaks
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="p-6 flex-1 overflow-auto">
        <div className="flex justify-between items-start mb-4">
          <Badge variant="outline" className="text-sm font-normal">
            Questão {currentIndex + 1}/{totalQuestions}
          </Badge>
          
          <div className="flex space-x-2">
            {/* Share button - available to everyone */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareDialogOpen(true)}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Compartilhar
            </Button>
            
            {/* Creator-only buttons */}
            {isCreator && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenEditModal(question)}
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mb-6 whitespace-pre-line">
          {renderFormattedText(question.statement)}
        </div>

        <div className="space-y-3 mt-6">
          {question.options.map((option, index) => {
            const optionId = `option-${question.id}-${index}`;
            const isSelected = userAnswer === index;
            const isCorrectOption = question.correct_index === index;

            let optionClass =
              "p-4 border rounded-lg cursor-pointer transition-all";

            if (!isAnswered) {
              optionClass += " hover:bg-gray-50";
            } else if (isSelected) {
              optionClass += isCorrectOption
                ? " bg-green-50 border-green-300"
                : " bg-red-50 border-red-300";
            } else if (isCorrectOption) {
              optionClass += " bg-green-50 border-green-300";
            }

            return (
              <div
                key={optionId}
                className={optionClass}
                onClick={() => !isAnswered && handleAnswer(index)}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    <span
                      className={`flex items-center justify-center h-6 w-6 rounded-full text-sm font-medium ${
                        isAnswered && isCorrectOption
                          ? "bg-green-100 text-green-800"
                          : isAnswered && isSelected
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <div className="flex-1">
                    {renderFormattedText(option)}
                  </div>
                  {isAnswered && isSelected && isCorrectOption && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-2 mt-0.5 flex-shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrectOption && (
                    <XCircle className="h-5 w-5 text-red-600 ml-2 mt-0.5 flex-shrink-0" />
                  )}
                  {isAnswered && !isSelected && isCorrectOption && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-2 mt-0.5 flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isAnswered && question.explanation && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
            <p className="font-medium text-blue-800 mb-1">Explicação:</p>
            <div className="text-blue-700 whitespace-pre-line">
              {renderFormattedText(question.explanation)}
            </div>
          </div>
        )}

        {/* Seção de comentários - apenas para quizzes públicos */}
        {isPublicQuiz && (
          <CommentSection 
            questionId={question.id} 
            userAnswer={userAnswer} 
            isPublicQuiz={isPublicQuiz}
          />
        )}
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A questão será permanentemente
              removida do quiz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDeleteQuestion(question.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      <ShareCodeDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        title={question.statement.length > 40 
          ? question.statement.substring(0, 40) + "..." 
          : question.statement}
        code={question.share_code}
        type="question"
      />
    </div>
  );
};

export default QuestionCard;
