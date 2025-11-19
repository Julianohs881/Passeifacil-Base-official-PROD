import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";

import { ExtendedQuiz } from "./types";
import { FilterValues } from "./ExploreFilters";

// Função para ordenar quizzes por relevância
const sortQuizzesByRelevance = (quizzes: ExtendedQuiz[], userProfile: any): ExtendedQuiz[] => {
  const userAreas = userProfile.interest_areas || [];
  const userSubareas = userProfile.interest_subareas || [];
  
  if (userAreas.length === 0 && userSubareas.length === 0) {
    return quizzes;
  }
  
  // Criar cópia do array para não modificar o original
  const sorted = [...quizzes];
  
  // Função para calcular o score de relevância de um quiz
  const getRelevanceScore = (quiz: ExtendedQuiz): number => {
    let score = 0;
    
    // Prioridade 1: Subárea de interesse exata (maior prioridade)
    if (quiz.subarea_of_interest && userSubareas.includes(quiz.subarea_of_interest)) {
      score += 100;
    }
    
    // Prioridade 2: Área de interesse exata
    if (quiz.area_of_interest && userAreas.includes(quiz.area_of_interest)) {
      score += 50;
    }
    
    return score;
  };
  
  // Ordenar: primeiro por score de relevância (maior primeiro), depois por data de criação (mais recente primeiro)
  sorted.sort((a, b) => {
    const scoreA = getRelevanceScore(a);
    const scoreB = getRelevanceScore(b);
    
    if (scoreB !== scoreA) {
      return scoreB - scoreA; // Maior score primeiro
    }
    
    // Se o score for igual, ordenar por data de criação (mais recente primeiro)
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });
  
  return sorted;
};

export const useExploreQuizzes = () => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const [quizzes, setQuizzes] = useState<ExtendedQuiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<ExtendedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [courseYears, setCourseYears] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);

  useEffect(() => {
    fetchPublicQuizzes();
  }, [userProfile?.interest_areas, userProfile?.interest_subareas]);

  const fetchPublicQuizzes = async () => {
    try {
      setLoading(true);
      // Buscar apenas quizzes públicos
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Buscar nomes dos criadores manualmente
      const userIds = [...new Set((data || []).map(q => q.user_id))];
      let userIdToName: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);
        (profiles || []).forEach(profile => {
          userIdToName[profile.id] = profile.name || "Usuário";
        });
      }

      // Transform the data para usar cor padrão
      let transformedData = (data || []).map(item => ({
        ...item,
        color: "bg-gray-50", // Cor padrão fixa
        createdBy: userIdToName[item.user_id] || "Usuário"
      })) as ExtendedQuiz[];
      
      // Ordenar por relevância baseado nas áreas/subáreas de interesse do usuário
      if (userProfile?.interest_areas || userProfile?.interest_subareas) {
        transformedData = sortQuizzesByRelevance(transformedData, userProfile);
      }
      
      setQuizzes(transformedData);
      setFilteredQuizzes(transformedData);
      
      // Extract unique values for filters
      const uniqueFaculties = Array.from(
        new Set(transformedData.map((quiz) => quiz.faculty).filter(Boolean))
      ) as string[];
      
      const uniqueCourseYears = Array.from(
        new Set(transformedData.map((quiz) => quiz.course_year).filter(Boolean))
      ) as string[];
      
      const uniqueCourses = Array.from(
        new Set(transformedData.map((quiz) => quiz.course).filter(Boolean))
      ) as string[];
      
      setFaculties(uniqueFaculties);
      setCourseYears(uniqueCourseYears);
      setCourses(uniqueCourses);
    } catch (error) {
      console.error("Error fetching public quizzes:", error);
      toast({
        title: "Erro ao carregar quizzes públicos",
        description: "Não foi possível carregar os quizzes públicos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (values: FilterValues) => {
    let result = [...quizzes];
    
    // Apply search filter
    if (values.search && values.search.trim() !== "") {
      const searchTerm = values.search.toLowerCase().trim();
      result = result.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm) ||
        (quiz.faculty && quiz.faculty.toLowerCase().includes(searchTerm)) ||
        (quiz.course && quiz.course.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply faculty filter
    if (values.faculty && values.faculty.trim() !== "" && values.faculty !== "all-faculties") {
      result = result.filter(quiz => 
        quiz.faculty === values.faculty
      );
    }
    
    // Apply course year filter
    if (values.courseYear && values.courseYear.trim() !== "" && values.courseYear !== "all-years") {
      result = result.filter(quiz => 
        quiz.course_year === values.courseYear
      );
    }
    
    // Apply course filter
    if (values.course && values.course.trim() !== "" && values.course !== "all-courses") {
      result = result.filter(quiz => 
        quiz.course === values.course
      );
    }
    
    // Apply area of interest filter
    if (values.areaOfInterest && values.areaOfInterest.trim() !== "" && values.areaOfInterest !== "all-areas") {
      result = result.filter(quiz => 
        quiz.area_of_interest === values.areaOfInterest
      );
    }
    
    // Apply subarea of interest filter
    if (values.subareaOfInterest && values.subareaOfInterest.trim() !== "" && values.subareaOfInterest !== "all-subareas") {
      result = result.filter(quiz => 
        quiz.subarea_of_interest === values.subareaOfInterest
      );
    }
    
    // Reordenar por relevância após aplicar filtros
    if (userProfile?.interest_areas || userProfile?.interest_subareas) {
      result = sortQuizzesByRelevance(result, userProfile);
    }
    
    setFilteredQuizzes(result);
  };

  const clearFilters = () => {
    return {
      search: "",
      faculty: "",
      courseYear: "",
      course: "",
      areaOfInterest: "",
      subareaOfInterest: "",
    };
  };

  return {
    quizzes,
    filteredQuizzes,
    loading,
    faculties,
    courseYears,
    courses,
    applyFilters,
    clearFilters,
    setFilteredQuizzes
  };
};
