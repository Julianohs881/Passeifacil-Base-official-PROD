
import { Quiz, VisibilityOption } from "@/types";
import QuizCard from "@/components/QuizCard";
import CreateQuizCard from "@/components/CreateQuizCard";

interface QuizGridProps {
  quizzes: Quiz[];
  onOpenCreateQuiz: () => void;
  onDeleteQuiz: (id: string) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onChangeColor: (quiz: Quiz) => void;
  onToggleVisibility: (quiz: Quiz, newVisibility: VisibilityOption) => void;
}

export const QuizGrid = ({
  quizzes,
  onOpenCreateQuiz,
  onDeleteQuiz,
  onEditQuiz,
  onChangeColor,
  onToggleVisibility,
}: QuizGridProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6">
      <CreateQuizCard onClick={onOpenCreateQuiz} />
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          onDelete={onDeleteQuiz}
          onEdit={onEditQuiz}
          onColorChange={onChangeColor}
          onToggleVisibility={onToggleVisibility}
        />
      ))}
    </div>
  );
};
