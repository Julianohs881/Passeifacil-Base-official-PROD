
import { Link } from "react-router-dom";
import { Book, Eye, School } from "lucide-react";
import { ExtendedQuiz } from "./types";
import { useAuth } from "@/context/AuthContext";

interface QuizExploreCardProps {
  quiz: ExtendedQuiz;
}

const QuizExploreCard = ({ quiz }: QuizExploreCardProps) => {
  const { user } = useAuth();

  return (
    <Link
      key={quiz.id}
      to={`/quiz/${quiz.id}`}
      className="block"
    >
      <div className={`quiz-card ${quiz.color} p-5 flex flex-col justify-between h-52 relative rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-lg`}>
        <div className="absolute top-3 left-3">
          <span className="bg-white bg-opacity-70 text-xs px-2 py-1 rounded-full flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            Público
          </span>
        </div>
        
        {/* Visualizar se o usuário atual é o criador para exibir controles */}
        {user && user.id === quiz.user_id && (
          <div className="absolute top-3 right-3 bg-white bg-opacity-70 text-xs px-2 py-1 rounded-full">
            Seu quiz
          </div>
        )}
        
        {/* Título do quiz centralizado */}
        <div className="flex-grow flex items-center justify-center">
          <h3 className="text-base font-medium text-white text-center">
            {quiz.title}
          </h3>
        </div>
        
        {/* Informações do curso */}
        <div className="mt-2 flex flex-col gap-1 text-white">
          {quiz.faculty && (
            <div className="flex items-center text-xs">
              <School className="h-3 w-3 mr-1" />
              {quiz.faculty}
            </div>
          )}
          {quiz.course && (
            <div className="flex items-center text-xs">
              <Book className="h-3 w-3 mr-1" />
              {quiz.course}
              {quiz.course_year && ` - ${quiz.course_year}`}
            </div>
          )}
          {!quiz.faculty && !quiz.course && (
            <div className="h-6"></div>
          )}
          
          {/* Nome do criador */}
          <div className="text-xs text-white text-right mt-1">
            Por: {quiz.createdBy}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default QuizExploreCard;
