import { Book, Eye, School, Play } from "lucide-react";
import { ExtendedQuiz } from "./types";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import QuizDetailModal from "../QuizDetailModal";

interface QuizExploreCardProps {
  quiz: ExtendedQuiz;
  onQuizClick: (quizId: string) => void;
}

const QuizExploreCard = ({ quiz, onQuizClick }: QuizExploreCardProps) => {
  const { user } = useAuth();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleClick = () => {
    setIsDetailModalOpen(true);
  };

  const handleStartQuiz = (quizId: string) => {
    onQuizClick(quizId);
    setIsDetailModalOpen(false);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="block hover:scale-105 transition-transform duration-200 cursor-pointer"
      >
        <div className="quiz-card bg-gray-50 p-4 h-32 sm:h-44 relative rounded-xl shadow-md hover:shadow-lg">
          <div className="absolute top-2 left-2">
            <span className="bg-white bg-opacity-70 text-xs px-2 py-1 rounded-full flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Público</span>
            </span>
          </div>
          
          {/* Visualizar se o usuário atual é o criador para exibir controles */}
          {user && user.id === quiz.user_id && (
            <div className="absolute top-2 right-2 bg-white bg-opacity-70 text-xs px-2 py-1 rounded-full">
              Seu quiz
            </div>
          )}
          
          {/* Título do quiz centralizado */}
          <div className="flex-grow flex items-center justify-center">
            <h3 className="text-sm sm:text-base font-medium text-black text-center break-words line-clamp-3">
              {quiz.title.toUpperCase()}
            </h3>
          </div>
        </div>
      </div>

      {/* Quiz Detail Modal */}
      <QuizDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        quiz={quiz}
        onStartQuiz={handleStartQuiz}
      />
    </>
  );
};

export default QuizExploreCard;
