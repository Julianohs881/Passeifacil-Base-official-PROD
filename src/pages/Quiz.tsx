
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Quiz as QuizType, Question, QuizResult } from "../types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionNavigator from "@/components/QuestionNavigator";
import AddQuestionModal from "@/components/AddQuestionModal";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { useToast } from "@/hooks/use-toast";
import NavBar from "@/components/NavBar";
import { Edit, Trash2, ChevronLeft, ChevronRight, Plus } from "lucide-react";

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | undefined>();
  const [activeTab, setActiveTab] = useState("responder");

  // Modal state for question management
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined);

  useEffect(() => {
    if (id && user) {
      fetchQuiz();
      fetchQuestions();
    }
  }, [id, user]);

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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    } else {
      // Calculate results if all questions answered
      if (Object.keys(userAnswers).length === questions.length) {
        calculateResults();
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(userAnswers[questions[currentQuestionIndex - 1]?.id] !== undefined);
    }
  };

  const selectQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowExplanation(userAnswers[questions[index]?.id] !== undefined);
  };

  const handleAnswer = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || userAnswers[currentQuestion.id] !== undefined) return;
    
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: optionIndex,
    });
    
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

  const resetQuiz = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setQuizResult(undefined);
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
      
      setQuestions(questions.filter((q) => q.id !== questionId));
      
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

  const handleEditQuestion = (question: Question) => {
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
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      ) : (
        <main className="container mx-auto px-4 py-8">
          {/* Back button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para Quizzes
            </Button>
          </div>
          
          {/* Quiz header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{quiz?.title || "Quiz"}</h1>
            {questions.length > 0 && (
              <p className="text-gray-600 mt-1">
                {questions.length} {questions.length === 1 ? "questão" : "questões"}
              </p>
            )}
          </div>

          {/* Quiz content */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b">
                <TabsList className="w-full justify-start h-auto p-0">
                  <TabsTrigger 
                    value="responder"
                    className="flex-1 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-violet-500"
                  >
                    Responder Quiz
                  </TabsTrigger>
                  <TabsTrigger 
                    value="gerenciar"
                    className="flex-1 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-violet-500"
                  >
                    Gerenciar Questões
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="responder" className="p-0 mt-0">
                {questions.length === 0 ? (
                  <div className="text-center py-16">
                    <h3 className="text-xl font-semibold text-gray-600 mb-4">
                      Este quiz ainda não tem questões
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Adicione questões na aba "Gerenciar Questões".
                    </p>
                    <Button 
                      onClick={() => setActiveTab("gerenciar")}
                      className="bg-violet-500 hover:bg-violet-600"
                    >
                      Adicionar Questões
                    </Button>
                  </div>
                ) : quizResult ? (
                  <div className="p-6">
                    <div className="bg-gray-50 rounded-lg p-8 max-w-xl mx-auto text-center">
                      <h2 className="text-2xl font-bold mb-6">Resultado Final</h2>
                      
                      <div className="mb-6 mx-auto w-40 h-40 rounded-full flex items-center justify-center border-8 border-violet-100">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-violet-600">
                            {quizResult.percentage.toFixed(0)}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {quizResult.correctAnswers}/{quizResult.totalQuestions}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-lg mb-8">
                        {quizResult.percentage >= 70
                          ? "Parabéns! Você foi muito bem!"
                          : quizResult.percentage >= 50
                          ? "Bom trabalho! Continue praticando."
                          : "Tente novamente para melhorar sua pontuação."}
                      </p>
                      
                      <Button
                        onClick={resetQuiz}
                        className="bg-violet-500 hover:bg-violet-600"
                      >
                        Tentar Novamente
                      </Button>
                    </div>
                  </div>
                ) : currentQuestion ? (
                  <div className="md:grid md:grid-cols-3 gap-6">
                    <div className="col-span-2 p-6">
                      <div className="mb-4 flex justify-between items-center">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                          Questão {currentQuestionIndex + 1} de {questions.length}
                        </span>
                      </div>
                      
                      <div className="mb-6">
                        <h2 className="text-xl font-medium mb-6">
                          {currentQuestion.statement}
                        </h2>
                        
                        <div className="space-y-3">
                          {currentQuestion.options.map((option, index) => {
                            const isSelected = userAnswers[currentQuestion.id] === index;
                            const isCorrect = index === currentQuestion.correct_index;
                            const showResult = userAnswers[currentQuestion.id] !== undefined;
                            
                            let buttonClass = "justify-start text-left border border-gray-300 font-normal hover:bg-gray-50";
                            
                            if (showResult) {
                              if (isCorrect) {
                                buttonClass = "justify-start text-left font-normal bg-quiz-correct border-green-500 hover:bg-green-100";
                              } else if (isSelected) {
                                buttonClass = "justify-start text-left font-normal bg-quiz-incorrect border-red-500 hover:bg-red-100";
                              }
                            }
                            
                            return (
                              <Button
                                key={index}
                                variant="outline"
                                className={`w-full h-auto py-3 px-4 ${buttonClass}`}
                                onClick={() => handleAnswer(index)}
                                disabled={showResult}
                              >
                                <span className="mr-3 font-medium">
                                  {String.fromCharCode(65 + index)}
                                </span>
                                {option}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {showExplanation && currentQuestion.explanation && (
                        <div className="mb-6 p-4 bg-violet-50 border border-violet-100 rounded-lg">
                          <h3 className="font-medium mb-2">Explicação</h3>
                          <p className="text-gray-700">{currentQuestion.explanation}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={handlePrevQuestion}
                          disabled={currentQuestionIndex === 0}
                          className="flex items-center space-x-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>Anterior</span>
                        </Button>
                        
                        {userAnswers[currentQuestion.id] !== undefined ? (
                          <Button
                            onClick={handleNextQuestion}
                            className="bg-violet-500 hover:bg-violet-600 flex items-center space-x-1"
                          >
                            <span>
                              {currentQuestionIndex < questions.length - 1
                                ? "Próxima"
                                : "Ver Resultado"}
                            </span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    
                    <div className="hidden md:block p-6">
                      <QuestionNavigator
                        questions={questions}
                        currentQuestionIndex={currentQuestionIndex}
                        onSelectQuestion={selectQuestion}
                        answeredQuestions={userAnswers}
                        quizResult={quizResult}
                      />
                    </div>
                  </div>
                ) : null}
              </TabsContent>
              
              <TabsContent value="gerenciar" className="p-6 mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium">Gerenciar Questões</h2>
                  <Button
                    onClick={() => {
                      setEditingQuestion(undefined);
                      setIsAddQuestionModalOpen(true);
                    }}
                    className="bg-violet-500 hover:bg-violet-600 flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Questão</span>
                  </Button>
                </div>
                
                {questions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      Sem questões
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Este quiz ainda não possui questões.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                            #
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                            Enunciado
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                            Alternativas
                          </th>
                          <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {questions.map((question, index) => (
                          <tr key={question.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4 align-top">
                              <span className="font-medium">{index + 1}</span>
                            </td>
                            <td className="py-4 px-4 align-top max-w-xs">
                              <div className="line-clamp-2">{question.statement}</div>
                            </td>
                            <td className="py-4 px-4 align-top">
                              <div className="text-sm text-gray-600">
                                {question.options.length} alternativas
                              </div>
                            </td>
                            <td className="py-4 px-4 align-top text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditQuestion(question)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:text-red-500"
                                  onClick={() => handleDeleteQuestion(question.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <AddQuestionModal
            isOpen={isAddQuestionModalOpen}
            onClose={() => {
              setIsAddQuestionModalOpen(false);
              setEditingQuestion(undefined);
            }}
            onSave={handleSaveQuestion}
            quizId={id || ""}
            question={editingQuestion}
          />
        </main>
      )}
    </div>
  );
};

export default Quiz;
