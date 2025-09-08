import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const FREE_PLAN_ACCESS_PERCENTAGE = 0.3; // 30%

export const useQuizAccessLimits = (totalQuestions: number, isCreator: boolean = false) => {
  const { isPro } = useAuth();
  const [isProUser, setIsProUser] = useState(false);

  useEffect(() => {
    setIsProUser(isPro());
  }, [isPro]);

  // Calcular quantas questões o usuário pode acessar
  const getAccessibleQuestionsCount = (): number => {
    if (isProUser || isCreator) {
      return totalQuestions; // Usuários PRO e criadores têm acesso total
    }
    
    return Math.ceil(totalQuestions * FREE_PLAN_ACCESS_PERCENTAGE);
  };

  // Verificar se uma questão específica está acessível
  const isQuestionAccessible = (questionIndex: number): boolean => {
    if (isProUser || isCreator) {
      return true; // Usuários PRO e criadores têm acesso a todas as questões
    }
    
    return questionIndex < getAccessibleQuestionsCount();
  };

  // Verificar se o usuário atingiu o limite
  const hasReachedLimit = (currentQuestionIndex: number): boolean => {
    if (isProUser || isCreator) {
      return false; // Usuários PRO e criadores nunca atingem limite
    }
    
    return currentQuestionIndex >= getAccessibleQuestionsCount();
  };

  // Obter informações sobre o progresso
  const getProgressInfo = (currentQuestionIndex: number) => {
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
    const progressInfo = getProgressInfo(currentQuestionIndex);
    
    if (isProUser || isCreator) {
      return null; // Usuários PRO e criadores não têm limitações
    }
    
    if (hasReachedLimit(currentQuestionIndex)) {
      return {
        title: "Limite do plano gratuito atingido",
        description: `Você respondeu ${progressInfo.accessibleCount} de ${progressInfo.totalCount} questões (30%). Desbloqueie o restante com o plano PRO!`,
        actionText: "Fazer upgrade para PRO"
      };
    }
    
    return null;
  };

  // Obter mensagem de progresso (quando ainda não atingiu o limite)
  const getProgressMessage = (currentQuestionIndex: number) => {
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
    getAccessibleQuestionsCount,
    isQuestionAccessible,
    hasReachedLimit,
    getProgressInfo,
    getLimitMessage,
    getProgressMessage,
    FREE_PLAN_ACCESS_PERCENTAGE
  };
};
