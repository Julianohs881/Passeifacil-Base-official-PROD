
import QuizExploreCard from "./QuizExploreCard";
import { ExtendedQuiz } from "./types";

interface QuizzesGridProps {
  quizzes: ExtendedQuiz[];
  loading: boolean;
  activeFilters: number;
}

const QuizzesGrid = ({ quizzes, loading, activeFilters }: QuizzesGridProps) => {
  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6EFD]"></div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-700">Nenhum quiz encontrado</h3>
        <p className="mt-2 text-gray-500">
          {activeFilters > 0 
            ? "Tente ajustar seus filtros para encontrar mais resultados." 
            : "Não há quizzes públicos disponíveis."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
      {quizzes.map((quiz) => (
        <QuizExploreCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  );
};

export default QuizzesGrid;
