
import { Quiz, VisibilityOption } from "@/types";
import QuizCard from "@/components/QuizCard";
import CreateQuizCard from "@/components/CreateQuizCard";

interface QuizGridProps {
  quizzes: Quiz[];
  onOpenCreateQuiz: () => void;
  onDeleteQuiz: (id: string) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onToggleVisibility: (quiz: Quiz, newVisibility: VisibilityOption) => void;
  onStartQuiz: (quizId: string) => void;
}

export const QuizGrid = ({
  quizzes,
  onOpenCreateQuiz,
  onDeleteQuiz,
  onEditQuiz,
  onToggleVisibility,
  onStartQuiz,
}: QuizGridProps) => {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6">
      <CreateQuizCard onClick={onOpenCreateQuiz} />
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          onDelete={onDeleteQuiz}
          onEdit={onEditQuiz}
          onToggleVisibility={onToggleVisibility}
          onStartQuiz={onStartQuiz}
        />
      ))}
    </div>
  );
};
