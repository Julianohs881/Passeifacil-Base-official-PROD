import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ExploreFilters, { FilterValues } from "@/components/Explore/ExploreFilters";
import QuizzesGrid from "@/components/Explore/QuizzesGrid";
import FreePlanLimits from "@/components/FreePlanLimits";
import { useExploreQuizzes } from "@/components/Explore/useExploreQuizzes";
import { useFreePlanLimits } from "@/hooks/useFreePlanLimits";
import { useToast } from "@/hooks/use-toast";

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

  const {
    exploredQuizzesCount,
    canExploreMore,
    getRemainingExploredQuizzes,
    showUpgradeToast,
    limits
  } = useFreePlanLimits();

  // Redirecionar usuários não-PRO para a página de assinatura
  useEffect(() => {
    if (!isPro()) {
      toast({
        title: "Recurso exclusivo PRO",
        description: "Faça upgrade para o plano PRO para explorar quizzes públicos.",
        variant: "destructive",
      });
      navigate("/subscription");
    }
  }, [isPro, navigate, toast]);

  // Se não for PRO, não renderiza o conteúdo
  if (!isPro()) {
    return null;
  }

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
    if (!isPro() && !canExploreMore()) {
      showUpgradeToast("explore");
      navigate("/subscription");
      return;
    }
    navigate(`/quiz/${quizId}`);
  };

  // Limitar quizzes exibidos para usuários gratuitos
  const displayedQuizzes = isPro() 
    ? filteredQuizzes 
    : filteredQuizzes.slice(0, limits.EXPLORED_QUIZZES);

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-0">Comunidade de Quizzes Públicos</h1>
      </div>
      
      {/* Mostrar limitações para usuários gratuitos */}
      {!isPro() && (
        <div className="mb-6">
          <FreePlanLimits
            currentCount={exploredQuizzesCount}
            limit={limits.EXPLORED_QUIZZES}
            feature="explore"
            onUpgrade={() => navigate("/subscription")}
          />
        </div>
      )}

      <div className="space-y-6">
        <ExploreFilters
          filters={filters}
          faculties={faculties}
          courseYears={courseYears}
          courses={courses}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
        
        <QuizzesGrid 
          quizzes={displayedQuizzes}
          loading={loading}
          onQuizClick={handleQuizClick}
        />
        
        {!isPro() && filteredQuizzes.length > limits.EXPLORED_QUIZZES && (
          <div className="text-center mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-700">
              Mostrando apenas {limits.EXPLORED_QUIZZES} quizzes do plano gratuito. 
              Faça upgrade para ver todos os {filteredQuizzes.length} quizzes disponíveis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
