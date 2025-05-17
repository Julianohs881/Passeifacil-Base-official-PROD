import React, { useState } from "react";
import { Question } from "../types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { ShareCodeDialog } from "./Share/ShareCodeDialog";
import QuizNavigationButtons from "./QuizNavigationButtons";
import { useMediaQuery } from "@/hooks/use-mobile";
import CommentSection from "./Comments/CommentSection";

// Import new components
import QuestionActions from "./Question/QuestionActions";
import QuestionOptions from "./Question/QuestionOptions";
import QuestionExplanation from "./Question/QuestionExplanation";
import DeleteQuestionDialog from "./Question/DeleteQuestionDialog";
import { useQuestionShare } from "./Question/useQuestionShare";
import FormattedText from "./Question/FormattedText";
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
  onPrevious?: () => void;
  onNext?: () => void;
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
  onPrevious,
  onNext
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const userAnswer = userAnswers[question.id];
  const isAnswered = userAnswer !== undefined;
  const {
    user,
    isPro
  } = useAuth();
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Check if the current user is the creator of the quiz
  const isCreator = user?.id === question.user_id;
  const isPROUser = isPro();

  // Use the share hook
  const {
    shareCode,
    isLoadingShareCode,
    isShareDialogOpen,
    handleOpenShareDialog,
    handleCloseShareDialog
  } = useQuestionShare(question, isPROUser);
  return <div className="flex flex-col h-full">
      <Card className="p-3 sm:p-6 flex-1 overflow-auto py-[57px]">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
          <Badge variant="outline" className="text-sm font-normal py-0">
            Questão {currentIndex + 1}/{totalQuestions}
          </Badge>
          
          <QuestionActions question={question} isCreator={isCreator} onOpenEditModal={onOpenEditModal} onOpenDeleteDialog={() => setIsDeleteDialogOpen(true)} onOpenShareDialog={handleOpenShareDialog} />
        </div>

        <div className="mb-6 whitespace-pre-line">
          <FormattedText text={question.statement} />
        </div>

        <QuestionOptions question={question} userAnswer={userAnswer} handleAnswer={handleAnswer} />

        <QuestionExplanation explanation={question.explanation} isVisible={isAnswered} />

        {/* Mobile Navigation Buttons - show only on mobile */}
        {isMobile && onPrevious && onNext && <div className="mt-8 mb-4">
            <QuizNavigationButtons currentIndex={currentIndex} totalQuestions={totalQuestions} onPrevious={onPrevious} onNext={onNext} />
          </div>}

        {/* Comments section - only for public quizzes and PRO users */}
        {isPublicQuiz && isPROUser && <CommentSection questionId={question.id} userAnswer={userAnswer} isPublicQuiz={isPublicQuiz} />}
      </Card>

      {/* Delete Question Dialog */}
      <DeleteQuestionDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onDelete={() => onDeleteQuestion(question.id)} />

      {/* Share Dialog - only if PRO user */}
      {isPROUser && <ShareCodeDialog isOpen={isShareDialogOpen} onClose={handleCloseShareDialog} title={question.statement.length > 40 ? question.statement.substring(0, 40) + "..." : question.statement} code={isLoadingShareCode ? null : shareCode} type="question" />}
    </div>;
};
export default QuestionCard;