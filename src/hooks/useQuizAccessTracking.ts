import { useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';

export const useQuizAccessTracking = () => {
  const { user } = useAuth();

  const trackQuizAccess = useCallback(async (quizId: string) => {
    try {
      await supabase
        .from('quiz_access_logs')
        .insert({
          quiz_id: quizId,
          user_id: user?.id || null,
          ip_address: null, // Não coletamos IP por questões de privacidade
          user_agent: navigator.userAgent
        });
    } catch (error) {
      // Silently fail - não queremos que erros de tracking afetem a experiência do usuário
      console.warn('Erro ao rastrear acesso ao quiz:', error);
    }
  }, [user?.id]);

  return {
    trackQuizAccess
  };
};


