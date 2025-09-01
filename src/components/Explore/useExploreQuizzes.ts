import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";

import { ExtendedQuiz } from "./types";
import { FilterValues } from "./ExploreFilters";

export const useExploreQuizzes = () => {
  const { toast } = useToast();
  
  const [quizzes, setQuizzes] = useState<ExtendedQuiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<ExtendedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [courseYears, setCourseYears] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);

  useEffect(() => {
    fetchPublicQuizzes();
  }, []);

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
      const transformedData = (data || []).map(item => ({
        ...item,
        color: "bg-gray-50", // Cor padrão fixa
        createdBy: userIdToName[item.user_id] || "Usuário"
      })) as ExtendedQuiz[];
      
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
    
    setFilteredQuizzes(result);
  };

  const clearFilters = () => {
    return {
      search: "",
      faculty: "",
      courseYear: "",
      course: "",
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
