
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { Quiz, Question, QuestionStatus, QuizResult } from '@/types';

export const useQuiz = (quizId: string | undefined) => {
  const { toast } = useToast();
  const { user } = useAuth();
  

  

  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Estado para rastrear o status de cada questão (respondida/não respondida)
  const [questionsStatus, setQuestionsStatus] = useState<Record<string, QuestionStatus>>({});
  
  // Estados para resultado e retry
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [previousResult, setPreviousResult] = useState<QuizResult | null>(null);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [retryIncorrectOnly, setRetryIncorrectOnly] = useState(false);

  // Buscar informações do quiz
  const fetchQuiz = async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (error) throw error;
      
      setQuiz(data as Quiz);
    } catch (error) {
      console.error('Erro ao buscar quiz:', error);
      toast({
        title: 'Erro ao carregar quiz',
        description: 'Não foi possível carregar os dados do quiz.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar questões do quiz
  const fetchQuestions = async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      
      // Buscar o quiz primeiro para pegar o user_id do criador
      const quizResponse = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();
      
      if (quizResponse.error) throw quizResponse.error;
      
      // Com o user_id do quiz, buscar as questões
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Adicionar o user_id do criador do quiz a cada questão
      const enhancedQuestions = (data || []).map(question => ({
        ...question,
        user_id: quizResponse.data?.user_id // Adicionar o user_id do criador a cada questão
      }));
      
      setQuestions(enhancedQuestions as Question[]);
      
      // Inicializar o estado de status das questões
      const initialStatus: Record<string, QuestionStatus> = {};
      enhancedQuestions.forEach(q => {
        initialStatus[q.id] = 'unanswered';
      });
      setQuestionsStatus(initialStatus);
      
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      toast({
        title: 'Erro ao carregar questões',
        description: 'Não foi possível carregar as questões do quiz.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Navegar para a questão anterior
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      if (retryIncorrectOnly) {
        // No modo retry, pular questões corretas
        const previousIncorrectIndex = findPreviousIncorrectQuestion(currentQuestionIndex);
        if (previousIncorrectIndex !== -1) {
          setCurrentQuestionIndex(previousIncorrectIndex);
        }
      } else {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    }
  };

  // Navegar para a próxima questão
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      if (retryIncorrectOnly) {
        // No modo retry, pular questões corretas
        const nextIncorrectIndex = findNextIncorrectQuestion(currentQuestionIndex);
        if (nextIncorrectIndex !== -1) {
          setCurrentQuestionIndex(nextIncorrectIndex);
        }
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  // Encontrar a próxima questão incorreta
  const findNextIncorrectQuestion = (currentIndex: number): number => {
    if (retryIncorrectOnly) {
      // No modo retry, procurar por questões que foram marcadas como 'unanswered' (que eram incorretas)
      for (let i = currentIndex + 1; i < questions.length; i++) {
        const questionId = questions[i].id;
        if (questionsStatus[questionId] === 'unanswered') {
          return i;
        }
      }
    } else {
      // No modo normal, procurar por questões incorretas
      for (let i = currentIndex + 1; i < questions.length; i++) {
        const questionId = questions[i].id;
        if (questionsStatus[questionId] === 'incorrect') {
          return i;
        }
      }
    }
    return -1; // Não encontrou próxima questão incorreta
  };

  // Encontrar a questão incorreta anterior
  const findPreviousIncorrectQuestion = (currentIndex: number): number => {
    if (retryIncorrectOnly) {
      // No modo retry, procurar por questões que foram marcadas como 'unanswered' (que eram incorretas)
      for (let i = currentIndex - 1; i >= 0; i--) {
        const questionId = questions[i].id;
        if (questionsStatus[questionId] === 'unanswered') {
          return i;
        }
      }
    } else {
      // No modo normal, procurar por questões incorretas
      for (let i = currentIndex - 1; i >= 0; i--) {
        const questionId = questions[i].id;
        if (questionsStatus[questionId] === 'incorrect') {
          return i;
        }
      }
    }
    return -1; // Não encontrou questão incorreta anterior
  };

  // Salvar resposta no banco de dados
  const saveAnswerToDatabase = async (questionId: string, optionIndex: number, isCorrect: boolean) => {
    if (!user) return; // Não salvar se não estiver logado
    
    try {
      const { error } = await supabase
        .from('quiz_answers')
        .upsert({
          question_id: questionId,
          user_id: user.id,
          selected_option: optionIndex,
          is_correct: isCorrect
        }, {
          onConflict: 'question_id,user_id'
        });

      if (error) {
        console.error('Erro ao salvar resposta:', error);
        // Não mostrar toast de erro para não interromper a experiência do usuário
      }
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
    }
  };

  // Manipular resposta do usuário
  const handleAnswer = (optionIndex: number) => {
    if (!questions[currentQuestionIndex]) return;
    
    const questionId = questions[currentQuestionIndex].id;
    
    // Se já respondeu, não faz nada
    if (userAnswers[questionId] !== undefined) {
      return;
    }
    
    // Atualizar as respostas do usuário
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
    
    // Atualizar status da questão como respondida (correta ou incorreta)
    const isCorrect = optionIndex === questions[currentQuestionIndex].correct_index;
    setQuestionsStatus(prev => ({
      ...prev,
      [questionId]: isCorrect ? 'correct' : 'incorrect'
    }));

    // Salvar resposta no banco de dados
    saveAnswerToDatabase(questionId, optionIndex, isCorrect);

    // Se estiver no modo retry e respondeu corretamente, navegar para próxima questão incorreta
    if (retryIncorrectOnly && isCorrect) {
      setTimeout(() => {
        const nextIncorrectIndex = findNextIncorrectQuestion(currentQuestionIndex);
        if (nextIncorrectIndex !== -1) {
          setCurrentQuestionIndex(nextIncorrectIndex);
        }
      }, 500); // Pequeno delay para mostrar feedback visual
    }
  };

  // Calcular resultado do quiz
  const calculateResult = (): QuizResult => {
    const totalQuestions = questions.length;
    const correctAnswers = Object.values(questionsStatus).filter(status => status === 'correct').length;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    return {
      correctAnswers,
      totalQuestions,
      percentage
    };
  };

  // Verificar se todas as questões foram respondidas
  const isQuizComplete = (): boolean => {
    return questions.length > 0 && Object.keys(userAnswers).length === questions.length;
  };

  // Finalizar quiz e mostrar resultado
  const finishQuiz = () => {
    if (!isQuizComplete()) return;
    
    const result = calculateResult();
    setQuizResult(result);
    setShowResult(true);
  };

  // Refazer apenas as questões incorretas
  const retryIncorrectQuestions = () => {
    const incorrectQuestionIds = Object.entries(questionsStatus)
      .filter(([_, status]) => status === 'incorrect')
      .map(([questionId, _]) => questionId);
    
    if (incorrectQuestionIds.length === 0) return;
    
    // Salvar resultado anterior
    setPreviousResult(quizResult);
    
    // Limpar respostas apenas das questões incorretas
    const newUserAnswers = { ...userAnswers };
    const newQuestionsStatus = { ...questionsStatus };
    
    incorrectQuestionIds.forEach(questionId => {
      delete newUserAnswers[questionId];
      newQuestionsStatus[questionId] = 'unanswered';
    });
    
    setUserAnswers(newUserAnswers);
    setQuestionsStatus(newQuestionsStatus);
    setShowResult(false);
    setIsRetryMode(true);
    setRetryIncorrectOnly(true);
    
    // Ir para a primeira questão incorreta
    const firstIncorrectIndex = questions.findIndex(q => incorrectQuestionIds.includes(q.id));
    if (firstIncorrectIndex !== -1) {
      setCurrentQuestionIndex(firstIncorrectIndex);
    }
  };

  // Refazer todo o quiz
  const retryAllQuestions = () => {
    // Salvar resultado anterior
    setPreviousResult(quizResult);
    
    // Limpar todas as respostas
    setUserAnswers({});
    setQuestionsStatus(prev => {
      const newStatus: Record<string, QuestionStatus> = {};
      Object.keys(prev).forEach(questionId => {
        newStatus[questionId] = 'unanswered';
      });
      return newStatus;
    });
    
    setShowResult(false);
    setIsRetryMode(true);
    setRetryIncorrectOnly(false);
    setCurrentQuestionIndex(0);
  };

  // Resetar para modo normal (não retry)
  const resetToNormalMode = () => {
    setIsRetryMode(false);
    setRetryIncorrectOnly(false);
    setPreviousResult(null);
  };

  // Adicionar nova questão
  const handleAddQuestion = async (
    question: Omit<Question, "id" | "created_at">
  ) => {
    try {
      const { data, error } = await supabase.from("questions").insert([
        {
          ...question,
          quiz_id: quizId,
        },
      ]).select();

      if (error) throw error;

      // Atualizar a lista de questões
      const newQuestion = { ...data[0], user_id: quiz?.user_id };
      setQuestions([...questions, newQuestion as Question]);
      
      // Inicializar o status da nova questão
      setQuestionsStatus(prev => ({
        ...prev,
        [newQuestion.id]: 'unanswered'
      }));

      toast({
        title: "Questão adicionada",
        description: "A questão foi adicionada com sucesso!",
      });
      
      // Navegar para a nova questão
      setCurrentQuestionIndex(questions.length);
      
      return newQuestion as Question;
    } catch (error) {
      console.error("Erro ao adicionar questão:", error);
      toast({
        title: "Erro ao adicionar questão",
        description: "Não foi possível adicionar a questão.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Atualizar questão existente
  const handleUpdateQuestion = async (
    id: string,
    question: Omit<Question, "id" | "created_at">
  ) => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .update({
          ...question,
        })
        .eq("id", id)
        .select();

      if (error) throw error;

      // Atualizar a lista de questões
      const updatedQuestion = { ...data[0], user_id: quiz?.user_id };
      setQuestions(
        questions.map((q) => (q.id === id ? updatedQuestion as Question : q))
      );

      toast({
        title: "Questão atualizada",
        description: "A questão foi atualizada com sucesso!",
      });
      
      return updatedQuestion as Question;
    } catch (error) {
      console.error("Erro ao atualizar questão:", error);
      toast({
        title: "Erro ao atualizar questão",
        description: "Não foi possível atualizar a questão.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Excluir questão
  const handleDeleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);

      if (error) throw error;

      // Atualizar a lista de questões
      const updatedQuestions = questions.filter((q) => q.id !== id);
      setQuestions(updatedQuestions);
      
      // Remover a questão do status
      const newStatus = { ...questionsStatus };
      delete newStatus[id];
      setQuestionsStatus(newStatus);
      
      // Remover a resposta do usuário para esta questão
      const newAnswers = { ...userAnswers };
      delete newAnswers[id];
      setUserAnswers(newAnswers);

      // Ajustar o índice da questão atual se necessário
      if (currentQuestionIndex >= updatedQuestions.length && updatedQuestions.length > 0) {
        setCurrentQuestionIndex(updatedQuestions.length - 1);
      }

      toast({
        title: "Questão removida",
        description: "A questão foi removida com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir questão:", error);
      toast({
        title: "Erro ao excluir questão",
        description: "Não foi possível excluir a questão.",
        variant: "destructive",
      });
    }
  };

  return {
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
  };
};
