import { Book, Eye, School } from "lucide-react";
import { ExtendedQuiz } from "./types";
import { useAuth } from "@/context/AuthContext";

interface QuizExploreCardProps {
  quiz: ExtendedQuiz;
  onQuizClick: (quizId: string) => void;
}

const QuizExploreCard = ({ quiz, onQuizClick }: QuizExploreCardProps) => {
  const { user } = useAuth();

  const handleClick = () => {
    onQuizClick(quiz.id);
  };

  return (
    <div
      onClick={handleClick}
      className="block hover:scale-105 transition-transform duration-200 cursor-pointer"
    >
      <div className={`quiz-card ${quiz.color} p-4 h-32 sm:h-44 relative rounded-xl shadow-md hover:shadow-lg`}>
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
          <h3 className="text-sm sm:text-base font-medium text-white text-center break-words line-clamp-3">
            {quiz.title}
          </h3>
        </div>
        
        {/* Informações do curso - posicionadas na parte inferior */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex flex-col gap-1 text-white">
            {quiz.faculty && (
              <div className="flex items-center text-xs">
                <School className="h-3 w-3 mr-1" />
                <span className="truncate">{quiz.faculty}</span>
              </div>
            )}
            {quiz.course && (
              <div className="flex items-center text-xs">
                <Book className="h-3 w-3 mr-1" />
                <span className="truncate">
                  {quiz.course}
                  {quiz.course_year && ` - ${quiz.course_year}`}
                </span>
              </div>
            )}
            
            {/* Nome do criador */}
            <div className="text-xs text-white text-right mt-1">
              Por: {quiz.createdBy}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizExploreCard;
