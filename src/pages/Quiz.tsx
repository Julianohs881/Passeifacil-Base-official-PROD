
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
import { ImportQuestionDialog } from "@/components/Share/ImportQuestionDialog";

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Modal state for question management
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined);
  const [isImportQuestionDialogOpen, setIsImportQuestionDialogOpen] = useState(false);

  // Use our custom hook to manage quiz state
  const {
    quiz,
    questions,
    loading,
    currentQuestionIndex,
    userAnswers,
    questionsStatus,
    fetchQuiz,
    fetchQuestions,
    goToPreviousQuestion,
    goToNextQuestion,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleAnswer,
    setCurrentQuestionIndex
  } = useQuiz(id);

  useEffect(() => {
    if (id && user) {
      fetchQuiz();
      fetchQuestions();
    }
  }, [id, user]);

  const handleOpenAddModal = () => {
    setEditingQuestion(undefined);
    setIsAddQuestionModalOpen(true);
  };

  const handleOpenEditModal = (question: Question) => {
    setEditingQuestion(question);
    setIsAddQuestionModalOpen(true);
  };

  const handleOpenImportQuestionDialog = () => {
    setIsImportQuestionDialogOpen(true);
  };

  const handleSaveQuestion = async (question: Omit<Question, "id" | "created_at">) => {
    if (editingQuestion) {
      await handleUpdateQuestion(editingQuestion.id, question);
    } else {
      await handleAddQuestion(question);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isPublicQuiz = quiz?.visibility === "public";
  const isCreator = user && quiz ? user.id === quiz.user_id : false;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6EFD]"></div>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          {/* Back button and Quiz Title */}
          <QuizHeader title={quiz?.title} />
          
          {/* Main content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Questions sidebar */}
            {questions.length > 0 && (
              <SidebarQuestionList 
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                onSelectQuestion={setCurrentQuestionIndex}
                questionsStatus={questionsStatus}
              />
            )}
            
            {/* Question content */}
            <div className="flex-1 overflow-auto p-6 md:p-6 sm:p-4">
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
              ) : currentQuestion ? (
                <QuestionCard
                  question={currentQuestion}
                  userAnswers={userAnswers}
                  handleAnswer={handleAnswer}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenEditModal={handleOpenEditModal}
                  onDeleteQuestion={handleDeleteQuestion}
                  currentIndex={currentQuestionIndex}
                  totalQuestions={questions.length}
                  isPublicQuiz={isPublicQuiz}
                />
              ) : null}
            </div>
          </div>
          
          {/* Navigation buttons - Mostramos botão de adicionar questão apenas para o criador */}
          {questions.length > 0 && (
            <QuizFooter
              quizId={id || ""}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              onPrevious={goToPreviousQuestion}
              onNext={goToNextQuestion}
              onAddQuestion={isCreator ? handleOpenAddModal : undefined}
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
              
              {/* Import Question Dialog */}
              <ImportQuestionDialog
                isOpen={isImportQuestionDialogOpen}
                onClose={() => setIsImportQuestionDialogOpen(false)}
                quizId={id || ""}
                onSuccess={fetchQuestions}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;
