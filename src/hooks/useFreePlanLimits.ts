import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FREE_PLAN_LIMITS = {
  EXPLORED_QUIZZES: 5
};

export const useFreePlanLimits = () => {
  const { user, userProfile, isPro } = useAuth();
  const { toast } = useToast();
  const [createdQuizzesCount, setCreatedQuizzesCount] = useState(0);
  const [exploredQuizzesCount, setExploredQuizzesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !isPro()) {
      fetchUsageCounts();
    }
  }, [user, userProfile]);

  const fetchUsageCounts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Buscar quantidade de quizzes criados
      const { count: createdCount, error: createdError } = await supabase
        .from("quizzes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (createdError) throw createdError;
      setCreatedQuizzesCount(createdCount || 0);

      // Para o futuro: buscar quizzes explorados (se implementarmos tracking)
      setExploredQuizzesCount(userProfile?.explored_quizzes_count || 0);
      
    } catch (error) {
      console.error("Erro ao buscar contadores de uso:", error);
    } finally {
      setLoading(false);
    }
  };

  const canCreateQuiz = () => true; // Sempre permite criar quizzes

  const canExploreMore = () => {
    if (isPro()) return true;
    return exploredQuizzesCount < FREE_PLAN_LIMITS.EXPLORED_QUIZZES;
  };

  const getRemainingCreatedQuizzes = () => Infinity; // Sempre retorna infinito

  const getRemainingExploredQuizzes = () => {
    if (isPro()) return Infinity;
    return Math.max(0, FREE_PLAN_LIMITS.EXPLORED_QUIZZES - exploredQuizzesCount);
  };

  const showUpgradeToast = (feature: "create" | "explore") => {
    const featureNames = {
      create: "criar mais quizzes",
      explore: "explorar mais quizzes"
    };
    
    toast({
      title: "Limite atingido",
      description: `Você atingiu o limite do plano gratuito para ${featureNames[feature]}. Faça upgrade para PRO!`,
      variant: "destructive",
      duration: 5000,
    });
  };

  return {
    loading,
    createdQuizzesCount,
    exploredQuizzesCount,
    canCreateQuiz,
    canExploreMore,
    getRemainingCreatedQuizzes,
    getRemainingExploredQuizzes,
    showUpgradeToast,
    refreshCounts: fetchUsageCounts,
    limits: FREE_PLAN_LIMITS
  };
};
