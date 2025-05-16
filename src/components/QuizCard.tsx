
import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, Palette, Eye, EyeOff, Share2 } from "lucide-react";
import { Quiz, VisibilityOption } from "../types";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ShareCodeDialog } from "./Share/ShareCodeDialog";

interface QuizCardProps {
  quiz: Quiz;
  onDelete: (id: string) => void;
  onEdit: (quiz: Quiz) => void;
  onColorChange: (quiz: Quiz) => void;
  onToggleVisibility?: (quiz: Quiz, newVisibility: VisibilityOption) => void;
}

const QuizCard = ({ quiz, onDelete, onEdit, onColorChange, onToggleVisibility }: QuizCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Verifica se o usuário atual é o criador do quiz
  const isCreator = user && user.id === quiz.user_id;

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

  const handleColorChange = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onColorChange(quiz);
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

  return (
    <>
      <Link
        to={`/quiz/${quiz.id}`}
        className="group relative block"
      >
        <div
          className={`quiz-card ${quiz.color} p-5 flex flex-col justify-between`}
        >
          {/* Indicador de visibilidade */}
          <div className="absolute top-3 left-3">
            {quiz.visibility === "public" ? (
              <span className="bg-white bg-opacity-70 text-xs px-2 py-1 rounded-full flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                Público
              </span>
            ) : (
              <span className="bg-white bg-opacity-70 text-xs px-2 py-1 rounded-full flex items-center">
                <EyeOff className="h-3 w-3 mr-1" />
                Privado
              </span>
            )}
          </div>

          {/* Action buttons - Mostrar apenas se o usuário for o criador */}
          <div className="absolute top-3 right-3 flex space-x-1">
            {/* Share button - available to everyone */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full bg-white bg-opacity-70 hover:bg-opacity-80 backdrop-blur-sm"
              onClick={handleShare}
              title="Compartilhar"
            >
              <Share2 className="h-3 w-3 text-gray-700" />
            </Button>
            
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-white bg-opacity-70 hover:bg-opacity-80 backdrop-blur-sm"
                  onClick={handleColorChange}
                >
                  <Palette className="h-3 w-3 text-gray-700" />
                </Button>
                {onToggleVisibility && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-white bg-opacity-70 hover:bg-opacity-80 backdrop-blur-sm"
                    onClick={handleToggleVisibility}
                    title={quiz.visibility === "public" ? "Tornar privado" : "Tornar público"}
                  >
                    {quiz.visibility === "public" ? (
                      <EyeOff className="h-3 w-3 text-gray-700" />
                    ) : (
                      <Eye className="h-3 w-3 text-gray-700" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-white bg-opacity-70 hover:bg-opacity-80 hover:bg-red-200"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3 text-gray-700" />
                </Button>
              </>
            )}
          </div>

          {/* Título do quiz centralizado verticalmente e horizontalmente */}
          <div className="flex-grow flex items-center justify-center">
            <h3 className="text-base font-medium text-white text-center">
              {quiz.title}
            </h3>
          </div>
        </div>
      </Link>

      {/* Share Dialog */}
      <ShareCodeDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        title={quiz.title}
        code={quiz.share_code}
        type="quiz"
      />
    </>
  );
};

export default QuizCard;
