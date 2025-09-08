import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ExploreFilters, { FilterValues } from "@/components/Explore/ExploreFilters";
import QuizzesGrid from "@/components/Explore/QuizzesGrid";
import { useExploreQuizzes } from "@/components/Explore/useExploreQuizzes";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown } from "lucide-react";

const Explore = () => {
  const { isPro } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    faculty: "",
    courseYear: "",
    course: "",
  });

  const {
    quizzes,
    filteredQuizzes,
    loading,
    faculties,
    courseYears,
    courses,
    applyFilters,
    clearFilters,
    setFilteredQuizzes
  } = useExploreQuizzes();

  // Permitir acesso para todos os usuários, mas com limitações para gratuitos

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = clearFilters();
    setFilters(clearedFilters);
    setFilteredQuizzes(quizzes);
  };

  const handleQuizClick = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };

  // Mostrar todos os quizzes para todos os usuários
  const displayedQuizzes = filteredQuizzes;

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-0">Comunidade de Quizzes Públicos</h1>
      </div>
      
      {/* Limitações removidas - todos os usuários podem ver todos os quizzes */}

      <div className="space-y-6">
        <ExploreFilters
          filters={filters}
          faculties={faculties}
          courseYears={courseYears}
          courses={courses}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
        
        {/* Indicador de scroll no mobile */}
        <div className="md:hidden text-center py-2">
          <div className="flex flex-col items-center text-gray-500 text-sm">
            <ChevronDown className="h-4 w-4 animate-bounce mb-1" />
            <span>Role para ver os quizzes</span>
          </div>
        </div>
        
        <QuizzesGrid 
          quizzes={displayedQuizzes}
          loading={loading}
          onQuizClick={handleQuizClick}
        />
        
        {/* Limitação de visualização removida - todos os usuários veem todos os quizzes */}
      </div>
    </div>
  );
};

export default Explore;
