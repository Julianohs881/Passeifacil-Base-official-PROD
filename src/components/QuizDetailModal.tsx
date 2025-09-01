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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {quiz.title.toUpperCase()}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Detalhes do quiz
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Informações do curso */}
          {quiz.faculty && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <School className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Faculdade</p>
                <p className="text-sm text-gray-600">{quiz.faculty}</p>
              </div>
            </div>
          )}
          
          {quiz.course && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Book className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Curso/Matéria</p>
                <p className="text-sm text-gray-600">{quiz.course}</p>
              </div>
            </div>
          )}
          
          {quiz.course_year && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Ano/Série</p>
                <p className="text-sm text-gray-600">{quiz.course_year}</p>
              </div>
            </div>
          )}

          {/* Criador do quiz */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <UserIcon className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Criado por</p>
              <p className="text-sm text-gray-600">{creatorName}</p>
            </div>
          </div>
          
          {/* Descrição */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Sobre este quiz</h4>
            <p className="text-sm text-blue-800">
              {quiz.description || "Este quiz contém questões relacionadas ao conteúdo estudado. Teste seus conhecimentos e veja como está seu aprendizado!"}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleStartQuiz}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
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
