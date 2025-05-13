import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Quiz as QuizType, Question, QuizResult } from "../types";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import SidebarQuestionList, { QuestionStatus } from "@/components/SidebarQuestionList";
import QuestionCard from "@/components/QuestionCard";
import AddEditQuestionModal from "@/components/AddEditQuestionModal";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { useToast } from "@/hooks/use-toast";
import NavBar from "@/components/NavBar";
import { useIsMobile } from "@/hooks/use-mobile";
import QuizNavigationButtons from "@/components/QuizNavigationButtons";

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [questionsStatus, setQuestionsStatus] = useState<Record<string, QuestionStatus>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | undefined>();

  // Modal state for question management
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined);

  // Function to go to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(userAnswers[questions[currentQuestionIndex - 1]?.id] !== undefined);
    }
  };

  // Function to go to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(userAnswers[questions[currentQuestionIndex + 1]?.id] !== undefined);
    } else {
      toast({
        title: "Fim do quiz",
        description: "Você chegou ao fim do quiz."
      });
    }
  };

  useEffect(() => {
    if (id && user) {
      fetchQuiz();
      fetchQuestions();
    }
  }, [id, user]);

  // Update question status when user answers
  useEffect(() => {
    const newQuestionStatus: Record<string, QuestionStatus> = {};
    
    Object.entries(userAnswers).forEach(([questionId, answerIndex]) => {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        if (answerIndex === question.correct_index) {
          newQuestionStatus[questionId] = 'correct';
        } else {
          newQuestionStatus[questionId] = 'incorrect';
        }
      }
    });
    
    setQuestionsStatus(newQuestionStatus);
  }, [userAnswers, questions]);

  const fetchQuiz = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      setQuiz(data);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast({
        title: "Erro ao carregar quiz",
        description: "Não foi possível carregar os detalhes do quiz.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchQuestions = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Erro ao carregar questões",
        description: "Não foi possível carregar as questões deste quiz.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowExplanation(userAnswers[questions[index]?.id] !== undefined);
  };

  const handleAnswer = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || userAnswers[currentQuestion.id] !== undefined) return;
    
    const newUserAnswers = {
      ...userAnswers,
      [currentQuestion.id]: optionIndex,
    };
    
    setUserAnswers(newUserAnswers);
    
    // Update question status
    const newQuestionsStatus = { ...questionsStatus };
    newQuestionsStatus[currentQuestion.id] = 
      optionIndex === currentQuestion.correct_index ? 'correct' : 'incorrect';
    setQuestionsStatus(newQuestionsStatus);
    
    setShowExplanation(true);
  };

  const calculateResults = () => {
    if (questions.length === 0) return;
    
    const correctAnswersCount = questions.reduce((count, question) => {
      return userAnswers[question.id] === question.correct_index
        ? count + 1
        : count;
    }, 0);
    
    const percentage = (correctAnswersCount / questions.length) * 100;
    
    setQuizResult({
      totalQuestions: questions.length,
      correctAnswers: correctAnswersCount,
      percentage,
    });
  };

  // Question management functions
  const handleAddQuestion = async (questionData: Omit<Question, "id" | "created_at">) => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .insert([questionData])
        .select();

      if (error) throw error;
      
      if (data) {
        setQuestions([...questions, ...data]);
        toast({
          title: "Questão adicionada com sucesso!",
          description: "A nova questão foi adicionada ao quiz.",
        });
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Erro ao adicionar questão",
        description: "Não foi possível adicionar a questão.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateQuestion = async (questionData: Omit<Question, "id" | "created_at">) => {
    if (!editingQuestion) return;
    
    try {
      const { error } = await supabase
        .from("questions")
        .update({
          statement: questionData.statement,
          options: questionData.options,
          correct_index: questionData.correct_index,
          explanation: questionData.explanation,
        })
        .eq("id", editingQuestion.id);

      if (error) throw error;
      
      setQuestions(
        questions.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                statement: questionData.statement,
                options: questionData.options,
                correct_index: questionData.correct_index,
                explanation: questionData.explanation,
              }
            : q
        )
      );
      
      // If this question was already answered, update its status
      if (userAnswers[editingQuestion.id] !== undefined) {
        const newUserAnswers = { ...userAnswers };
        const newQuestionsStatus = { ...questionsStatus };
        
        newQuestionsStatus[editingQuestion.id] = 
          userAnswers[editingQuestion.id] === questionData.correct_index 
            ? 'correct' 
            : 'incorrect';
            
        setQuestionsStatus(newQuestionsStatus);
      }
      
      toast({
        title: "Questão atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });
      
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Erro ao atualizar questão",
        description: "Não foi possível atualizar a questão.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;
      
      const newQuestions = questions.filter((q) => q.id !== questionId);
      setQuestions(newQuestions);
      
      // Remove from user answers and status
      if (userAnswers[questionId]) {
        const newUserAnswers = { ...userAnswers };
        delete newUserAnswers[questionId];
        setUserAnswers(newUserAnswers);
        
        const newQuestionsStatus = { ...questionsStatus };
        delete newQuestionsStatus[questionId];
        setQuestionsStatus(newQuestionsStatus);
      }
      
      // Adjust currentQuestionIndex if needed
      if (currentQuestionIndex >= newQuestions.length && newQuestions.length > 0) {
        setCurrentQuestionIndex(newQuestions.length - 1);
      }
      
      toast({
        title: "Questão excluída com sucesso!",
        description: "A questão foi removida do quiz.",
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Erro ao excluir questão",
        description: "Não foi possível excluir a questão.",
        variant: "destructive",
      });
    }
  };

  const handleOpenAddModal = () => {
    setEditingQuestion(undefined);
    setIsAddQuestionModalOpen(true);
  };

  const handleOpenEditModal = (question: Question) => {
    setEditingQuestion(question);
    setIsAddQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (question: Omit<Question, "id" | "created_at">) => {
    if (editingQuestion) {
      await handleUpdateQuestion(question);
    } else {
      await handleAddQuestion(question);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

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
          <div className="px-4 py-4 border-b bg-white">
            <div className="container mx-auto max-w-[1200px] flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <h1 className="text-xl font-semibold ml-4">{quiz?.title || "Quiz"}</h1>
            </div>
          </div>
          
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
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-600 mb-4">
                    Este quiz ainda não tem questões
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Adicione questões para começar.
                  </p>
                  <Button 
                    onClick={handleOpenAddModal}
                    className="bg-[#0D6EFD] hover:bg-blue-600"
                  >
                    Adicionar Questão
                  </Button>
                </div>
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
                />
              ) : null}
            </div>
          </div>
          
          {/* Navigation buttons */}
          {questions.length > 0 && (
            <QuizNavigationButtons
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              onPrevious={goToPreviousQuestion}
              onNext={goToNextQuestion}
            />
          )}
          
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
        </div>
      )}
    </div>
  );
};

export default Quiz;
