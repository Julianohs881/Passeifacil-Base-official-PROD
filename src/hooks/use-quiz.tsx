
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/utils/supabase';
import { Quiz, Question, QuestionStatus } from '@/types';

export const useQuiz = (quizId: string | undefined) => {
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Estado para rastrear o status de cada questão (respondida/não respondida)
  const [questionsStatus, setQuestionsStatus] = useState<Record<string, QuestionStatus>>({});

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
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Navegar para a próxima questão
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
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
    fetchQuiz,
    fetchQuestions,
    goToPreviousQuestion,
    goToNextQuestion,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleAnswer,
    setCurrentQuestionIndex,
  };
};
