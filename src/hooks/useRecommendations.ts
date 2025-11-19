import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useInterestAreas, InterestArea } from './useInterestAreas';
import { supabase } from '@/utils/supabase';
import { ExtendedQuiz } from '@/components/Explore/types';

export const useRecommendations = () => {
  const { userProfile } = useAuth();
  const { interestAreas } = useInterestAreas();
  const [recommendedQuizzes, setRecommendedQuizzes] = useState<ExtendedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    const userAreas = userProfile?.interest_areas || [];
    const userSubareas = userProfile?.interest_subareas || [];
    
    if (userAreas.length === 0 && userSubareas.length === 0) {
      setRecommendedQuizzes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Buscar quizzes públicos que correspondem às áreas/subáreas de interesse do usuário
      // Usar os campos area_of_interest e subarea_of_interest dos quizzes
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('visibility', 'public')
          .order('access_count', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(100); // Buscar mais para filtrar depois

        if (error) throw error;

        // Buscar nomes dos criadores
        const userIds = [...new Set((data || []).map(q => q.user_id))];
        let userIdToName: Record<string, string> = {};
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', userIds);
          (profiles || []).forEach(profile => {
            userIdToName[profile.id] = profile.name || "Usuário";
          });
        }

        // Filtrar quizzes que correspondem às áreas/subáreas de interesse do usuário
        const matchingQuizzes = (data || []).filter(quiz => {
          // Prioridade 1: Verificar se o quiz tem subárea que corresponde às subáreas do usuário
          if (quiz.subarea_of_interest && userSubareas.includes(quiz.subarea_of_interest)) {
            return true;
          }
          
          // Prioridade 2: Verificar se o quiz tem área que corresponde às áreas do usuário
          if (quiz.area_of_interest && userAreas.includes(quiz.area_of_interest)) {
            return true;
          }
          
          return false;
        });

        // Ordenar por relevância: subáreas primeiro, depois áreas, depois por data
        const sortedQuizzes = matchingQuizzes.sort((a, b) => {
          // Verificar se tem subárea correspondente (maior prioridade)
          const aHasMatchingSubarea = a.subarea_of_interest && userSubareas.includes(a.subarea_of_interest);
          const bHasMatchingSubarea = b.subarea_of_interest && userSubareas.includes(b.subarea_of_interest);
          
          if (aHasMatchingSubarea && !bHasMatchingSubarea) return -1;
          if (!aHasMatchingSubarea && bHasMatchingSubarea) return 1;
          
          // Se ambos têm ou não têm subárea, verificar área
          const aHasMatchingArea = a.area_of_interest && userAreas.includes(a.area_of_interest);
          const bHasMatchingArea = b.area_of_interest && userAreas.includes(b.area_of_interest);
          
          if (aHasMatchingArea && !bHasMatchingArea) return -1;
          if (!aHasMatchingArea && bHasMatchingArea) return 1;
          
          // Se ambos têm correspondência ou não têm, ordenar por data (mais recente primeiro)
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });

        // Transformar os dados e limitar a 10
        const transformedData = sortedQuizzes.slice(0, 10).map(item => ({
          ...item,
          color: "bg-gray-50",
          createdBy: userIdToName[item.user_id] || "Usuário",
          access_count: item.access_count || 0
        })) as ExtendedQuiz[];

        setRecommendedQuizzes(transformedData);
      } catch (dbError) {
        console.error('Erro ao buscar recomendações do banco:', dbError);
        setRecommendedQuizzes([]);
      }
      
    } catch (err) {
      console.error('Erro ao buscar recomendações:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userProfile?.interest_areas, userProfile?.interest_subareas]);

  const getAreaName = (areaId: string): string => {
    const area = interestAreas.find(a => a.id === areaId);
    return area?.name || 'Área desconhecida';
  };

  const getAreaColor = (areaId: string): string => {
    const area = interestAreas.find(a => a.id === areaId);
    return area?.color || '#6B7280';
  };

  const getAreaIcon = (areaId: string): string | null => {
    const area = interestAreas.find(a => a.id === areaId);
    return area?.icon || null;
  };

  return {
    recommendedQuizzes,
    loading,
    error,
    refetch: fetchRecommendations,
    getAreaName,
    getAreaColor,
    getAreaIcon,
    hasInterestAreas: (userProfile?.interest_areas && userProfile.interest_areas.length > 0) || 
                      (userProfile?.interest_subareas && userProfile.interest_subareas.length > 0)
  };
};
