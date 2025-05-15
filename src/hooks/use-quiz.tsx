
import { useState, useEffect } from "react";
import { Quiz, Question, QuizResult, parseColorOption } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import { QuestionStatus } from "@/components/SidebarQuestionList";

export const useQuiz = (quizId: string | undefined) => {
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [questionsStatus, setQuestionsStatus] = useState<Record<string, QuestionStatus>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | undefined>();

  // Fetch quiz data
  const fetchQuiz = async () => {
    if (!quizId) return;
    
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (error) throw error;
      
      // Transform the data to ensure color is a valid ColorOption
      const transformedData = {
        ...data,
        color: parseColorOption(data.color)
      } as Quiz;
      
      setQuiz(transformedData);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast({
        title: "Erro ao carregar quiz",
        description: "Não foi possível carregar os detalhes do quiz.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Fetch questions
  const fetchQuestions = async () => {
    if (!quizId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", quizId)
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

  // Navigation functions
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(userAnswers[questions[currentQuestionIndex - 1]?.id] !== undefined);
    }
  };

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

  // Question management
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

  const handleUpdateQuestion = async (questionId: string, questionData: Omit<Question, "id" | "created_at">) => {
    try {
      const { error } = await supabase
        .from("questions")
        .update({
          statement: questionData.statement,
          options: questionData.options,
          correct_index: questionData.correct_index,
          explanation: questionData.explanation,
        })
        .eq("id", questionId);

      if (error) throw error;
      
      setQuestions(
        questions.map((q) =>
          q.id === questionId
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
      if (userAnswers[questionId] !== undefined) {
        const newQuestionsStatus = { ...questionsStatus };
        
        newQuestionsStatus[questionId] = 
          userAnswers[questionId] === questionData.correct_index 
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

  // Handle user answering a question
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

  // Calculate quiz results
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

  // Update question status based on user answers
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

  return {
    quiz,
    questions,
    loading,
    currentQuestionIndex,
    userAnswers,
    questionsStatus,
    showExplanation,
    quizResult,
    fetchQuiz,
    fetchQuestions,
    goToPreviousQuestion,
    goToNextQuestion,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleAnswer,
    calculateResults,
    setCurrentQuestionIndex,
    setShowExplanation
  };
};
