import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useQuizAccessLimits = (totalQuestions: number, isCreator: boolean = false) => {
  const { isPro, isProfileLoaded } = useAuth();
  const [isProUser, setIsProUser] = useState(false);
  const [limitsReady, setLimitsReady] = useState(isCreator);

  useEffect(() => {
    if (isCreator) {
      setIsProUser(true);
      setLimitsReady(true);
      return;
    }

    if (!isProfileLoaded) {
      return;
    }

    setIsProUser(isPro());
    setLimitsReady(true);
  }, [isPro, isProfileLoaded, isCreator]);

  // Nova regra de acesso:
  // Se total ≤ 20 → liberar 30% arredondado pra cima
  // Se total > 20 → liberar o mínimo entre 10 e 30% do total
  const getAccessibleQuestionsCount = (): number => {
    if (!limitsReady) {
      return totalQuestions;
    }

    if (isProUser || isCreator) {
      return totalQuestions; // Usuários PRO e criadores têm acesso total
    }
    
    if (totalQuestions <= 20) {
      // Para quizzes com 20 ou menos questões: 30% arredondado para cima
      return Math.ceil(totalQuestions * 0.3);
    } else {
      // Para quizzes com mais de 20 questões: mínimo entre 10 e 30%
      const thirtyPercent = Math.ceil(totalQuestions * 0.3);
      return Math.min(10, thirtyPercent);
    }
  };

  // Verificar se uma questão específica está acessível
  const isQuestionAccessible = (questionIndex: number): boolean => {
    if (!limitsReady) {
      return true;
    }

    if (isProUser || isCreator) {
      return true; // Usuários PRO e criadores têm acesso a todas as questões
    }
    
    return questionIndex < getAccessibleQuestionsCount();
  };

  // Verificar se o usuário atingiu o limite
  const hasReachedLimit = (currentQuestionIndex: number): boolean => {
    if (!limitsReady) {
      return false;
    }

    if (isProUser || isCreator) {
      return false; // Usuários PRO e criadores nunca atingem limite
    }
    
    return currentQuestionIndex >= getAccessibleQuestionsCount();
  };

  // Obter informações sobre o progresso
  const getProgressInfo = (currentQuestionIndex: number) => {
    if (!limitsReady) {
      return {
        accessibleCount: totalQuestions,
        totalCount: totalQuestions,
        remainingFree: totalQuestions - (currentQuestionIndex + 1),
        lockedCount: 0,
        percentageUsed: totalQuestions === 0 ? 0 : Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100),
        percentageOfTotal: totalQuestions === 0 ? 0 : Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
      };
    }

    const accessibleCount = getAccessibleQuestionsCount();
    const totalCount = totalQuestions;
    const remainingFree = Math.max(0, accessibleCount - currentQuestionIndex - 1);
    const lockedCount = totalCount - accessibleCount;
    
    return {
      accessibleCount,
      totalCount,
      remainingFree,
      lockedCount,
      percentageUsed: Math.round(((currentQuestionIndex + 1) / accessibleCount) * 100),
      percentageOfTotal: Math.round(((currentQuestionIndex + 1) / totalCount) * 100)
    };
  };

  // Obter mensagem de limite atingido
  const getLimitMessage = (currentQuestionIndex: number) => {
    if (!limitsReady) {
      return null;
    }

    const progressInfo = getProgressInfo(currentQuestionIndex);
    
    if (isProUser || isCreator) {
      return null; // Usuários PRO e criadores não têm limitações
    }
    
    if (hasReachedLimit(currentQuestionIndex)) {
      const percentage = totalQuestions <= 20 ? '30%' : 'até 10 questões';
      return {
        title: "Limite do plano gratuito atingido",
        description: `Você respondeu ${progressInfo.accessibleCount} de ${progressInfo.totalCount} questões (${percentage}). Desbloqueie o restante com o plano PRO!`,
        actionText: "Fazer upgrade para PRO"
      };
    }
    
    return null;
  };

  // Obter mensagem de progresso (quando ainda não atingiu o limite)
  const getProgressMessage = (currentQuestionIndex: number) => {
    if (!limitsReady) {
      return null;
    }

    if (isProUser || isCreator) {
      return null; // Usuários PRO e criadores não precisam de mensagens de progresso
    }
    
    const progressInfo = getProgressInfo(currentQuestionIndex);
    
    if (progressInfo.remainingFree <= 2 && progressInfo.remainingFree > 0) {
      return {
        title: "Quase no limite!",
        description: `Você já acessou ${progressInfo.percentageOfTotal}% do quiz. Restam apenas ${progressInfo.remainingFree} questões gratuitas.`,
        actionText: "Fazer upgrade para PRO"
      };
    }
    
    return null;
  };

  return {
    isProUser,
    limitsReady,
    getAccessibleQuestionsCount,
    isQuestionAccessible,
    hasReachedLimit,
    getProgressInfo,
    getLimitMessage,
    getProgressMessage
  };
};
