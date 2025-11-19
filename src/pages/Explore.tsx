import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ExploreFilters, { FilterValues } from "@/components/Explore/ExploreFilters";
import QuizzesGrid from "@/components/Explore/QuizzesGrid";
import QuizExploreCard from "@/components/Explore/QuizExploreCard";
import { useExploreQuizzes } from "@/components/Explore/useExploreQuizzes";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Explore = () => {
  const { isPro } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    faculty: "",
    courseYear: "",
    course: "",
    areaOfInterest: "",
    subareaOfInterest: "",
  });

  const [showRecommendations, setShowRecommendations] = useState(true);

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
    recommendedQuizzes,
    loading: recommendationsLoading,
    hasInterestAreas,
    getAreaName,
    getAreaColor,
    getAreaIcon
  } = useRecommendations();

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
    // Rastrear acesso ao quiz
    import('@/hooks/useQuizAccessTracking').then(({ useQuizAccessTracking }) => {
      const { trackQuizAccess } = useQuizAccessTracking();
      trackQuizAccess(quizId);
    });
    
    navigate(`/quiz/${quizId}`);
  };

  // Mostrar todos os quizzes para todos os usuários
  const displayedQuizzes = filteredQuizzes;

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-0">Comunidade de Quizzes Públicos</h1>
      </div>

      <div className="space-y-6">
        {/* Seção de Recomendações */}
        {hasInterestAreas && showRecommendations && (
          <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-violet-600" />
                  <CardTitle className="text-lg">Recomendados para Você</CardTitle>
                </div>
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <CardDescription>
                Quizzes que correspondem às suas áreas de interesse (baseado no campo CURSO/MATERIA)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
                </div>
              ) : recommendedQuizzes.length > 0 ? (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {recommendedQuizzes.map((quiz) => (
                    <QuizExploreCard 
                      key={quiz.id} 
                      quiz={quiz} 
                      onQuizClick={handleQuizClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Nenhum quiz encontrado que corresponda às suas áreas de interesse</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Verifique se há quizzes com CURSO/MATERIA similar às suas áreas de interesse
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
      </div>
    </div>
  );
};

export default Explore;
