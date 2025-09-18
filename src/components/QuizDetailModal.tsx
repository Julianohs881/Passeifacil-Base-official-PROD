import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Book, School, User, Play, User as UserIcon } from "lucide-react";
import { Quiz } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface QuizDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
  onStartQuiz: (quizId: string) => void;
}

const QuizDetailModal: React.FC<QuizDetailModalProps> = ({
  isOpen,
  onClose,
  quiz,
  onStartQuiz,
}) => {
  const { user } = useAuth();
  
  if (!quiz) return null;

  const handleStartQuiz = () => {
    onStartQuiz(quiz.id);
    onClose();
  };

  // Verificar se é um ExtendedQuiz (tem campo createdBy)
  const extendedQuiz = quiz as any;
  const creatorName = extendedQuiz.createdBy || (user && user.id === quiz.user_id ? "Você" : "Usuário");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
            {quiz.title.toUpperCase()}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Detalhes do quiz
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
          {/* Informações do curso */}
          {quiz.faculty && (
            <div className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
              <School className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Faculdade</p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{quiz.faculty}</p>
              </div>
            </div>
          )}
          
          {quiz.course && (
            <div className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
              <Book className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Curso/Matéria</p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{quiz.course}</p>
              </div>
            </div>
          )}
          
          {quiz.course_year && (
            <div className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Ano/Série</p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{quiz.course_year}</p>
              </div>
            </div>
          )}

          {/* Criador do quiz */}
          <div className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-gray-900 text-sm sm:text-base">Criado por</p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{creatorName}</p>
            </div>
          </div>
          
          {/* Descrição */}
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Sobre este quiz</h4>
            <p className="text-xs sm:text-sm text-blue-800 line-clamp-3">
              {quiz.description || "Este quiz contém questões relacionadas ao conteúdo estudado. Teste seus conhecimentos e veja como está seu aprendizado!"}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-6 sticky bottom-0 bg-white pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleStartQuiz}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
          >
            <Play className="mr-2 h-4 w-4" />
            Iniciar Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuizDetailModal;
