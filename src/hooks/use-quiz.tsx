
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { useQuizAccessLimits } from './useQuizAccessLimits';
import { Quiz, Question, QuestionStatus, QuizResult } from '@/types';

export const useQuiz = (quizId: string | undefined) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Chave para localStorage baseada no quizId e userId
  const getStorageKey = (key: string) => `quiz_${quizId}_${user?.id}_${key}`;
  
  // Função para carregar estado do localStorage
  const loadFromStorage = (key: string, defaultValue: any) => {
    if (typeof window === 'undefined' || !quizId || !user?.id) return defaultValue;
    try {
      const stored = localStorage.getItem(getStorageKey(key));
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return defaultValue;
    }
  };

  // Função para salvar estado no localStorage
  const saveToStorage = (key: string, value: any) => {
    if (typeof window === 'undefined' || !quizId || !user?.id) return;
    try {
      localStorage.setItem(getStorageKey(key), JSON.stringify(value));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  // Função para limpar o localStorage do quiz
  const clearQuizStorage = () => {
    if (typeof window === 'undefined' || !quizId || !user?.id) return;
    try {
      // Não limpar userAnswers e questionsStatus para manter as respostas persistidas
      const keys = [
        'currentQuestionIndex',
        'showResult',
        'quizResult',
        'previousResult',
        'isRetryMode',
        'retryIncorrectOnly'
      ];
      
      console.log('clearQuizStorage: Limpando localStorage (mantendo respostas)');
      keys.forEach(key => {
        localStorage.removeItem(getStorageKey(key));
      });
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  };
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => 
    loadFromStorage('currentQuestionIndex', 0)
  );
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>(() => 
    loadFromStorage('userAnswers', {})
  );
  const [loading, setLoading] = useState(true);
  const [answersLoaded, setAnswersLoaded] = useState(false); // Flag para controlar se as respostas foram carregadas

  // Estado para rastrear o status de cada questão (respondida/não respondida)
  const [questionsStatus, setQuestionsStatus] = useState<Record<string, QuestionStatus>>(() => 
    loadFromStorage('questionsStatus', {})
  );
  
  // Estados para resultado e retry
  const [showResult, setShowResult] = useState(() => 
    loadFromStorage('showResult', false)
  );
  const [quizResult, setQuizResult] = useState<QuizResult | null>(() => 
    loadFromStorage('quizResult', null)
  );
  const [previousResult, setPreviousResult] = useState<QuizResult | null>(() => 
    loadFromStorage('previousResult', null)
  );
  const [isRetryMode, setIsRetryMode] = useState(() => 
    loadFromStorage('isRetryMode', false)
  );
  const [retryIncorrectOnly, setRetryIncorrectOnly] = useState(() => 
    loadFromStorage('retryIncorrectOnly', false)
  );

  // Hook para gerenciar limites de acesso
  const quizAccessLimits = useQuizAccessLimits(questions.length, user && quiz ? user.id === quiz.user_id : false);

  // Carregar dados do quiz quando o componente for montado
  useEffect(() => {
    if (quizId) {
      fetchQuiz();
      fetchQuestions();
    }
  }, [quizId]);

  // Carregar respostas do usuário quando as questões estiverem carregadas
  useEffect(() => {
    console.log('useEffect fetchUserAnswers: Verificando condições', {
      questionsLength: questions.length,
      hasUser: !!user,
      shouldFetch: questions.length > 0
    });
    
    if (questions.length > 0) {
      console.log('useEffect fetchUserAnswers: Chamando fetchUserAnswers');
      fetchUserAnswers();
    }
  }, [questions, user]);

  // Persistir estado no localStorage sempre que mudar
  useEffect(() => {
    saveToStorage('currentQuestionIndex', currentQuestionIndex);
  }, [currentQuestionIndex]);

  useEffect(() => {
    saveToStorage('userAnswers', userAnswers);
  }, [userAnswers]);

  useEffect(() => {
    saveToStorage('questionsStatus', questionsStatus);
  }, [questionsStatus]);

  useEffect(() => {
    saveToStorage('showResult', showResult);
  }, [showResult]);

  useEffect(() => {
    saveToStorage('quizResult', quizResult);
  }, [quizResult]);

  useEffect(() => {
    saveToStorage('previousResult', previousResult);
  }, [previousResult]);

  useEffect(() => {
    saveToStorage('isRetryMode', isRetryMode);
  }, [isRetryMode]);

  useEffect(() => {
    saveToStorage('retryIncorrectOnly', retryIncorrectOnly);
  }, [retryIncorrectOnly]);

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

  // Buscar respostas salvas do usuário
  const fetchUserAnswers = async () => {
    if (!quizId || !user) {
      console.log('fetchUserAnswers: quizId ou user não disponível', { quizId, user: !!user });
      setAnswersLoaded(true); // Marcar como carregado mesmo se não houver usuário
      return;
    }

    try {
      console.log('fetchUserAnswers: Iniciando busca de respostas...', {
        quizId,
        userId: user.id,
        questionsCount: questions.length
      });

      // Buscar todas as respostas do usuário para este quiz
      const { data: answers, error } = await supabase
        .from('quiz_answers')
        .select('question_id, selected_option, is_correct')
        .eq('user_id', user.id)
        .in('question_id', questions.map(q => q.id));

      if (error) {
        console.error('Erro na query do Supabase:', error);
        throw error;
      }

      console.log('fetchUserAnswers: Respostas encontradas:', answers);

      if (answers && answers.length > 0) {
        // Mapear as respostas para o estado userAnswers
        const answersMap: Record<string, number> = {};
        const statusMap: Record<string, QuestionStatus> = {};

        answers.forEach(answer => {
          answersMap[answer.question_id] = answer.selected_option;
          statusMap[answer.question_id] = answer.is_correct ? 'correct' : 'incorrect';
        });

        // Sempre carregar do banco de dados, sobrescrevendo dados locais
        // Isso garante que as respostas persistidas sejam sempre carregadas
        console.log('fetchUserAnswers: Carregando respostas do banco de dados');
        setUserAnswers(answersMap);
        setQuestionsStatus(prev => ({
          ...prev,
          ...statusMap
        }));

        console.log('fetchUserAnswers: Respostas carregadas do banco:', answersMap);
        console.log('fetchUserAnswers: Status carregado do banco:', statusMap);
      } else {
        console.log('fetchUserAnswers: Nenhuma resposta encontrada para este usuário');
      }
    } catch (error) {
      console.error('fetchUserAnswers: Erro ao carregar respostas do usuário:', error);
    } finally {
      // Sempre marcar como carregado, independente de sucesso ou erro
      setAnswersLoaded(true);
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
      const nextIndex = currentQuestionIndex + 1;
      
      // Verificar se a próxima questão está acessível
      if (!quizAccessLimits.isQuestionAccessible(nextIndex)) {
        // Mostrar toast de limite atingido
        const limitMessage = quizAccessLimits.getLimitMessage(nextIndex);
        if (limitMessage) {
          toast({
            title: limitMessage.title,
            description: limitMessage.description,
            variant: "destructive",
            duration: 5000,
          });
        }
        return;
      }
      
      if (retryIncorrectOnly) {
        // No modo retry, pular questões corretas
        const nextIncorrectIndex = findNextIncorrectQuestion(currentQuestionIndex);
        if (nextIncorrectIndex !== -1) {
          setCurrentQuestionIndex(nextIncorrectIndex);
        }
      } else {
        setCurrentQuestionIndex(nextIndex);
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
    if (!user) {
      console.log('saveAnswerToDatabase: Usuário não logado, não salvando');
      return; // Não salvar se não estiver logado
    }
    
    console.log('saveAnswerToDatabase: Salvando resposta no banco', {
      questionId,
      optionIndex,
      isCorrect,
      userId: user.id
    });
    
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
        console.error('saveAnswerToDatabase: Erro ao salvar resposta:', error);
        // Não mostrar toast de erro para não interromper a experiência do usuário
      } else {
        console.log('saveAnswerToDatabase: Resposta salva com sucesso');
      }
    } catch (error) {
      console.error('saveAnswerToDatabase: Erro ao salvar resposta:', error);
    }
  };

  // Manipular resposta do usuário
  const handleAnswer = (optionIndex: number) => {
    if (!questions[currentQuestionIndex]) return;
    
    const questionId = questions[currentQuestionIndex].id;
    
    // Verificar se a questão atual está acessível
    if (!quizAccessLimits.isQuestionAccessible(currentQuestionIndex)) {
      const limitMessage = quizAccessLimits.getLimitMessage(currentQuestionIndex);
      if (limitMessage) {
        toast({
          title: limitMessage.title,
          description: limitMessage.description,
          variant: "destructive",
          duration: 5000,
        });
      }
      return;
    }
    
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
    console.log('handleAnswer: Atualizando status da questão', {
      questionId,
      optionIndex,
      correctIndex: questions[currentQuestionIndex].correct_index,
      isCorrect,
      newStatus: isCorrect ? 'correct' : 'incorrect'
    });
    
    setQuestionsStatus(prev => {
      const newStatus = {
        ...prev,
        [questionId]: isCorrect ? 'correct' : 'incorrect'
      };
      console.log('handleAnswer: Novo questionsStatus', newStatus);
      return newStatus;
    });

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
    // Só verificar se o quiz está completo se as respostas foram carregadas
    if (!answersLoaded || questions.length === 0) {
      return false;
    }
    
    // Calcular quantas questões o usuário pode realmente responder
    const accessibleQuestionsCount = questions.filter((_, index) => 
      quizAccessLimits.isQuestionAccessible(index)
    ).length;
    
    // O quiz está completo quando todas as questões acessíveis foram respondidas
    const answeredCount = Object.keys(userAnswers).length;
    const isComplete = answeredCount === accessibleQuestionsCount;
    
    console.log('isQuizComplete: Verificando conclusão do quiz', {
      answeredCount,
      accessibleQuestionsCount,
      totalQuestions: questions.length,
      isComplete,
      userAnswers: Object.keys(userAnswers),
      accessibleQuestions: questions.map((_, index) => ({
        index,
        accessible: quizAccessLimits.isQuestionAccessible(index)
      }))
    });
    
    return isComplete;
  };

  // Finalizar quiz e mostrar resultado
  const finishQuiz = () => {
    console.log('finishQuiz: Tentando finalizar quiz', {
      isComplete: isQuizComplete(),
      answersLoaded,
      questionsLength: questions.length,
      userAnswersCount: Object.keys(userAnswers).length,
      isRetryMode
    });
    
    if (!isQuizComplete()) {
      console.log('finishQuiz: Quiz não está completo, não finalizando');
      return;
    }
    
    console.log('finishQuiz: Finalizando quiz e calculando resultado');
    const result = calculateResult();
    console.log('finishQuiz: Resultado calculado', result);
    
    setQuizResult(result);
    setShowResult(true);
    
    // Limpar o localStorage quando o quiz for finalizado
    clearQuizStorage();
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
    answersLoaded,
    fetchQuiz,
    fetchQuestions,
    fetchUserAnswers,
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
    clearQuizStorage,
    // Limites de acesso
    ...quizAccessLimits,
  };

};
