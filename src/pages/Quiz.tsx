import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Question } from "../types";
import { useAuth } from "@/context/AuthContext";
import { useQuiz } from "@/hooks/use-quiz";
import AddEditQuestionModal from "@/components/AddEditQuestionModal";
import SidebarQuestionList from "@/components/SidebarQuestionList";
import QuestionCard from "@/components/QuestionCard";
import NavBar from "@/components/NavBar";
import QuizHeader from "@/components/Quiz/QuizHeader";
import QuizFooter from "@/components/Quiz/QuizFooter";
import QuizEmptyState from "@/components/Quiz/QuizEmptyState";
import QuizResult from "@/components/Quiz/QuizResult";
import QuizAccessLimits from "@/components/Quiz/QuizAccessLimits";
import { ImportQuestionDialog } from "@/components/Share/ImportQuestionDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AIUsageDisplay from "@/components/CreateWithAI/AIUsageDisplay";

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isPro } = useAuth();





  // Modal state for question management
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined);
  const [isImportQuestionDialogOpen, setIsImportQuestionDialogOpen] = useState(false);
  const [isPremiumWarningOpen, setIsPremiumWarningOpen] = useState(false);
  
  // Use our custom hook to manage quiz state
  const {
    quiz,
    questions,
    loading,
    currentQuestionIndex,
    userAnswers,
    questionsStatus,
    showResult,
    quizResult,
    previousResult,
    isRetryMode,
    retryIncorrectOnly,
    fetchQuiz,
    fetchQuestions,
    goToPreviousQuestion,
    goToNextQuestion,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleAnswer,
    setCurrentQuestionIndex,
    calculateResult,
    isQuizComplete,
    finishQuiz,
    retryIncorrectQuestions,
    retryAllQuestions,
    resetToNormalMode,
    findNextIncorrectQuestion,
    findPreviousIncorrectQuestion,
    // Limites de acesso
    isProUser,
    getAccessibleQuestionsCount,
    isQuestionAccessible,
    hasReachedLimit,
    getProgressInfo,
    getLimitMessage,
    getProgressMessage
  } = useQuiz(id);

  useEffect(() => {
    if (id && user) {
      fetchQuiz();
      fetchQuestions();
    }
  }, [id, user]);

  // Calcular variáveis derivadas
  const currentQuestion = questions[currentQuestionIndex];
  const isPublicQuiz = quiz?.visibility === "public";
  const isCreator = user && quiz ? user.id === quiz.user_id : false;
  const isPROUser = isPro();

  // Verificar se o quiz foi concluído e mostrar resultado
  useEffect(() => {
    if (isQuizComplete() && !showResult) {
      finishQuiz();
    }
  }, [userAnswers, questions.length, showResult]);

  const handleOpenAddModal = () => {
    setEditingQuestion(undefined);
    setIsAddQuestionModalOpen(true);
  };

  const handleOpenEditModal = (question: Question) => {
    setEditingQuestion(question);
    setIsAddQuestionModalOpen(true);
  };

  const handleOpenImportQuestionDialog = () => {
    if (isPro()) {
      setIsImportQuestionDialogOpen(true);
    } else {
      setIsPremiumWarningOpen(true);
    }
  };

  const handleSaveQuestion = async (question: Omit<Question, "id" | "created_at">) => {
    if (editingQuestion) {
      await handleUpdateQuestion(editingQuestion.id, question);
    } else {
      await handleAddQuestion(question);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6EFD]"></div>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          {/* Back button and Quiz Title with action buttons */}
          <QuizHeader 
            title={quiz?.title} 
            quizId={id}
            onAddQuestion={isCreator ? handleOpenAddModal : undefined}
            onQuestionCreated={fetchQuestions}
            isCreator={isCreator}
            onImportQuestion={isCreator ? handleOpenImportQuestionDialog : undefined}
          />
          
          {/* Pro user AI usage display */}
          {isPROUser && isCreator && (
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
              <div className="container mx-auto">
                <AIUsageDisplay variant="compact" />
              </div>
            </div>
          )}
          
          {/* Main content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Questions sidebar */}
            {questions.length > 0 && !showResult && (
              <SidebarQuestionList 
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                onSelectQuestion={setCurrentQuestionIndex}
                questionsStatus={questionsStatus}
                isQuestionAccessible={isCreator ? undefined : isQuestionAccessible}
                isProUser={isProUser || isCreator}
                onUpgradeClick={() => navigate('/subscription')}
              />
            )}
            
            {/* Question content */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-6 w-full">
              {questions.length === 0 ? (
                isCreator ? (
                  <QuizEmptyState
                    quizId={id || ""}
                    onAddQuestion={handleOpenAddModal}
                    onQuestionCreated={fetchQuestions}
                  />
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-700">
                      Este quiz ainda não possui questões
                    </h3>
                    <p className="mt-2 text-gray-500">
                      Volte mais tarde quando o criador adicionar questões
                    </p>
                  </div>
                )
              ) : showResult && quizResult ? (
                <QuizResult
                  correctAnswers={quizResult.correctAnswers}
                  totalQuestions={quizResult.totalQuestions}
                  percentage={quizResult.percentage}
                  onRetryIncorrect={retryIncorrectQuestions}
                  onRetryAll={retryAllQuestions}
                  isRetry={isRetryMode}
                  previousResult={previousResult}
                />
              ) : currentQuestion ? (
                <>
                  <QuestionCard
                    question={currentQuestion}
                    userAnswers={userAnswers}
                    handleAnswer={handleAnswer}
                    onOpenAddModal={isCreator ? handleOpenAddModal : undefined}
                    onOpenEditModal={isCreator ? handleOpenEditModal : undefined}
                    onDeleteQuestion={isCreator ? handleDeleteQuestion : undefined}
                    currentIndex={currentQuestionIndex}
                    totalQuestions={questions.length}
                    isPublicQuiz={isPublicQuiz}
                    onPrevious={goToPreviousQuestion}
                    onNext={goToNextQuestion}
                    isQuestionAccessible={isCreator ? undefined : isQuestionAccessible}
                    isProUser={isProUser || isCreator}
                    onUpgradeClick={() => navigate('/subscription')}
                  />
                  
                  {/* Exibir limites de acesso apenas para quizzes da comunidade (não-PRO e não-criador) */}
                  {!isCreator && !isProUser && questions.length > 0 && (
                    <QuizAccessLimits
                      currentQuestionIndex={currentQuestionIndex}
                      totalQuestions={questions.length}
                      accessibleCount={getAccessibleQuestionsCount()}
                      remainingFree={getProgressInfo(currentQuestionIndex).remainingFree}
                      lockedCount={getProgressInfo(currentQuestionIndex).lockedCount}
                      percentageUsed={getProgressInfo(currentQuestionIndex).percentageUsed}
                      percentageOfTotal={getProgressInfo(currentQuestionIndex).percentageOfTotal}
                      onUpgradeClick={() => navigate('/subscription')}
                    />
                  )}
                </>
              ) : null}
            </div>
          </div>
          
          {/* Navigation buttons */}
          {questions.length > 0 && !showResult && (
            <QuizFooter
              quizId={id || ""}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              onPrevious={goToPreviousQuestion}
              onNext={goToNextQuestion}
              onAddQuestion={undefined} // Remove from footer since it's now in header
              onQuestionCreated={fetchQuestions}
              onImportQuestion={isCreator ? handleOpenImportQuestionDialog : undefined}
            />
          )}
          
          {/* Modal de adicionar/editar questão - disponível apenas para o criador */}
          {isCreator && (
            <>
              <AddEditQuestionModal
                isOpen={isAddQuestionModalOpen}
                onClose={() => {
                  setIsAddQuestionModalOpen(false);
                  setEditingQuestion(undefined);
                }}
                onSave={handleSaveQuestion}
                quizId={id || ""}
                question={editingQuestion}
              />
              
              {/* Import Question Dialog - only show for PRO users */}
              {isPROUser && (
                <ImportQuestionDialog
                  isOpen={isImportQuestionDialogOpen}
                  onClose={() => setIsImportQuestionDialogOpen(false)}
                  quizId={id || ""}
                  onSuccess={fetchQuestions}
                />
              )}
              
              {/* Premium Feature Warning Dialog */}
              <Dialog open={isPremiumWarningOpen} onOpenChange={setIsPremiumWarningOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Recurso Pro</DialogTitle>
                    <DialogDescription>
                      Função exclusiva para assinantes PRO. Faça upgrade para liberar esta ferramenta!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-center mt-4">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 border-0"
                      onClick={() => setIsPremiumWarningOpen(false)}
                    >
                      Fazer Upgrade
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;
