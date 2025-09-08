import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { AnswerStats } from '@/types';

export const useAnswerStats = (questionId: string | undefined) => {
  const [stats, setStats] = useState<AnswerStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswerStats = async () => {
    if (!questionId) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar todas as respostas para esta questão
      const { data: answers, error: fetchError } = await supabase
        .from('quiz_answers')
        .select('selected_option, is_correct')
        .eq('question_id', questionId);

      if (fetchError) throw fetchError;

      if (!answers || answers.length === 0) {
        setStats([]);
        return;
      }

      // Calcular estatísticas para cada opção
      const totalAnswers = answers.length;
      const optionCounts: Record<number, { count: number; isCorrect: boolean }> = {};

      // Inicializar contadores para todas as opções (0, 1, 2, 3)
      for (let i = 0; i < 4; i++) {
        optionCounts[i] = { count: 0, isCorrect: false };
      }

      // Contar respostas por opção
      answers.forEach(answer => {
        const optionIndex = answer.selected_option;
        if (optionCounts[optionIndex]) {
          optionCounts[optionIndex].count++;
          // Marcar como correta se pelo menos uma resposta for correta
          if (answer.is_correct) {
            optionCounts[optionIndex].isCorrect = true;
          }
        }
      });

      // Converter para array de estatísticas
      const statsArray: AnswerStats[] = Object.entries(optionCounts).map(([optionIndex, data]) => ({
        optionIndex: parseInt(optionIndex),
        count: data.count,
        percentage: totalAnswers > 0 ? Math.round((data.count / totalAnswers) * 100) : 0,
        isCorrect: data.isCorrect
      }));

      setStats(statsArray);
    } catch (err) {
      console.error('Erro ao buscar estatísticas das respostas:', err);
      setError('Erro ao carregar estatísticas');
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswerStats();
  }, [questionId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchAnswerStats
  };
};
