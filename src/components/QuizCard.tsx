
import { useState } from "react";
import { Edit, Trash2, Eye, EyeOff, Share2 } from "lucide-react";
import { Quiz, VisibilityOption } from "../types";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ShareCodeDialog } from "./Share/ShareCodeDialog";
import QuizDetailModal from "./QuizDetailModal";

interface QuizCardProps {
  quiz: Quiz;
  onDelete: (id: string) => void;
  onEdit: (quiz: Quiz) => void;
  onToggleVisibility?: (quiz: Quiz, newVisibility: VisibilityOption) => void;
  onStartQuiz: (quizId: string) => void;
}

const QuizCard = ({ quiz, onDelete, onEdit, onToggleVisibility, onStartQuiz }: QuizCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();
  const { user, isPro } = useAuth();

  // Verifica se o usuário atual é o criador do quiz
  const isCreator = user && user.id === quiz.user_id;

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      onDelete(quiz.id);
    } catch (error) {
      toast({
        title: "Erro ao excluir quiz",
        description: "Não foi possível excluir este quiz.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(quiz);
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleVisibility) {
      const newVisibility: VisibilityOption = quiz.visibility === "public" ? "private" : "public";
      onToggleVisibility(quiz, newVisibility);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareDialogOpen(true);
  };

  const isPROUser = isPro();

  return (
    <>
      <div
        onClick={handleCardClick}
        className="block hover:scale-105 transition-transform duration-200 cursor-pointer"
      >
        <div className="quiz-card bg-gray-50 p-4 h-32 sm:h-44 relative rounded-xl shadow-md hover:shadow-lg">
          {/* Indicador de visibilidade */}
          <div className="absolute top-2 left-2">
            {quiz.visibility === "public" ? (
              <span className="bg-white bg-opacity-70 text-xs px-2 py-1 rounded-full flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Público</span>
              </span>
            ) : (
              <span className="bg-white bg-opacity-70 text-xs px-2 py-1 rounded-full flex items-center">
                <EyeOff className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Privado</span>
              </span>
            )}
          </div>

          {/* Action buttons - Mostrar apenas se o usuário for o criador */}
          <div className="absolute top-2 right-2 flex space-x-1">
            {/* Share button - only show for PRO users */}
            {isPROUser && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full bg-white bg-opacity-70 hover:bg-opacity-80 backdrop-blur-sm"
                onClick={handleShare}
                title="Compartilhar"
              >
                <Share2 className="h-3 w-3 text-gray-700" />
              </Button>
            )}
            
            {/* Creator-only buttons */}
            {isCreator && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-white bg-opacity-70 hover:bg-opacity-80 backdrop-blur-sm"
                  onClick={handleEdit}
                >
                  <Edit className="h-3 w-3 text-gray-700" />
                </Button>
                {/* Only show visibility toggle for PRO users */}
                {onToggleVisibility && isPROUser && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-white bg-opacity-70 hover:bg-opacity-80 backdrop-blur-sm"
                    onClick={handleToggleVisibility}
                    title={quiz.visibility === "public" ? "Tornar privado" : "Tornar público"}
                  >
                    {quiz.visibility === "public" ? (
                      <Eye className="h-3 w-3 text-gray-700" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-gray-700" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-white bg-opacity-70 hover:bg-opacity-80 backdrop-blur-sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  title="Excluir"
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-gray-700"></div>
                  ) : (
                    <Trash2 className="h-3 w-3 text-gray-700" />
                  )}
                </Button>
              </>
            )}
          </div>
          
          {/* Título do quiz centralizado */}
          <div className="flex-grow flex items-center justify-center">
            <h3 className="text-sm sm:text-base font-medium text-black text-center break-words line-clamp-3">
              {quiz.title.toUpperCase()}
            </h3>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <ShareCodeDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        title={quiz.title}
        code={quiz.share_code}
        type="quiz"
      />

      {/* Quiz Detail Modal */}
      <QuizDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        quiz={quiz}
        onStartQuiz={onStartQuiz}
      />
    </>
  );
};

export default QuizCard;
